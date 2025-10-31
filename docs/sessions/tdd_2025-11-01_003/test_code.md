# 테스트 코드 문서: 반복 일정 수정 (단일/전체 선택)

**작성자**: Poseidon (테스트 코드 작성자)  
**작성일**: 2025-10-31  
**Session ID**: tdd_2025-11-01_003  
**참조 문서**: `test_spec.md`

---

## 1. 개요

### 1.1 테스트 파일 정보

- **파일 경로**: `src/__tests__/medium.repeatEventEdit.spec.tsx`
- **테스트 대상**: 반복 일정 수정 시 다이얼로그 및 단일/전체 수정 로직
- **테스트 프레임워크**: Vitest + React Testing Library

### 1.2 구현 범위

- TC-001: 다이얼로그 표시
- TC-002: "예" 선택 - 단일 수정
- TC-003: "아니오" 선택 - 전체 수정
- TC-004: 단일 일정 수정
- TC-005: 반복 아이콘 제거
- TC-006: 반복 아이콘 유지
- TC-007: 다이얼로그 취소

---

## 2. 주요 테스트 케이스

### 2.1 TC-001: 다이얼로그 표시

**핵심 로직**:

```typescript
// 반복 일정 수정 시도
await user.click(editButtons[0]);
await user.clear(titleInput);
await user.type(titleInput, '긴급 팀 회의');
await user.click(screen.getByTestId('event-submit-button'));

// 다이얼로그 표시 확인
const dialog = await screen.findByRole('dialog');
expect(dialog).toBeInTheDocument();
expect(within(dialog).getByText('반복 일정 수정')).toBeInTheDocument();
expect(within(dialog).getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();

// 버튼 확인
const yesButton = within(dialog).getByRole('button', { name: '예' });
const noButton = within(dialog).getByRole('button', { name: '아니오' });
expect(yesButton).toBeInTheDocument();
expect(noButton).toBeInTheDocument();
```

**설명**:

1. Mock 반복 일정 생성 (repeat.type !== 'none', repeat.id 있음)
2. 일정 수정 폼 열기
3. 제목 변경
4. "일정 추가" 버튼 클릭
5. 다이얼로그 표시 및 내용 확인

**예상 결과 (Red Phase)**:

- ❌ FAIL: 다이얼로그가 표시되지 않음

---

### 2.2 TC-002: "예" 선택 - 단일 수정

**핵심 로직**:

```typescript
// API 호출 감시
let apiCalled = false;
let requestBody: any;

server.use(
  http.put('/api/events/:id', async ({ request, params }) => {
    apiCalled = true;
    requestBody = await request.json();
    return HttpResponse.json({ ...requestBody, id: params.id });
  })
);

// 수정 시도 및 "예" 클릭
await user.click(editButtons[0]);
await user.clear(titleInput);
await user.type(titleInput, '특별 회의');
await user.click(screen.getByTestId('event-submit-button'));

const dialog = await screen.findByRole('dialog');
const yesButton = within(dialog).getByRole('button', { name: '예' });
await user.click(yesButton);

// 검증
await waitFor(() => {
  expect(apiCalled).toBe(true);
});
expect(requestBody.repeat.type).toBe('none');
expect(requestBody.title).toBe('특별 회의');
```

**설명**:

1. 반복 일정 수정 폼 열기
2. 제목 변경
3. "일정 추가" 버튼 클릭
4. 다이얼로그에서 "예" 클릭
5. `PUT /api/events/:id` 호출 확인
6. `repeat.type`이 `'none'`으로 설정되었는지 확인

**예상 결과 (Red Phase)**:

- ❌ FAIL: 다이얼로그 없음, 단일 수정 로직 없음

---

### 2.3 TC-003: "아니오" 선택 - 전체 수정

**핵심 로직**:

```typescript
// API 호출 감시
let apiCalled = false;
let requestBody: any;
let calledRepeatId: string | undefined;

server.use(
  http.put('/api/recurring-events/:repeatId', async ({ request, params }) => {
    apiCalled = true;
    calledRepeatId = params.repeatId as string;
    requestBody = await request.json();
    return HttpResponse.json([]);
  })
);

// 수정 시도 및 "아니오" 클릭
await user.click(editButtons[1]);
// ... 데이터 변경 ...
await user.click(screen.getByTestId('event-submit-button'));

const dialog = await screen.findByRole('dialog');
const noButton = within(dialog).getByRole('button', { name: '아니오' });
await user.click(noButton);

// 검증
await waitFor(() => {
  expect(apiCalled).toBe(true);
});
expect(calledRepeatId).toBe('repeat-456');
expect(requestBody.title).toBe('팀 미팅');
expect(requestBody.startTime).toBe('14:00');
expect(requestBody.endTime).toBe('15:00');
expect(requestBody.location).toBe('회의실 B');
```

**설명**:

1. 반복 일정 수정 (제목, 시간, 위치 변경)
2. "일정 추가" 버튼 클릭
3. 다이얼로그에서 "아니오" 클릭
4. `PUT /api/recurring-events/:repeatId` 호출 확인
5. Request body에 변경된 데이터 포함 확인

**예상 결과 (Red Phase)**:

- ❌ FAIL: 다이얼로그 없음, 전체 수정 로직 없음

---

### 2.4 TC-004: 단일 일정 수정

**핵심 로직**:

```typescript
// Mock 단일 일정
const mockSingleEvent: Event = {
  id: 'single-1',
  title: '점심 약속',
  date: '2025-11-05',
  startTime: '12:00',
  endTime: '13:00',
  description: '동료와 점심',
  location: '식당',
  category: '개인',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

// 수정
await user.click(editButton);
await user.clear(titleInput);
await user.type(titleInput, '저녁 약속');
await user.click(screen.getByTestId('event-submit-button'));

// 다이얼로그가 표시되지 않음 확인
await waitFor(() => {
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

// API 호출 확인 (다이얼로그 없이 바로 호출됨)
await waitFor(() => {
  expect(apiCalled).toBe(true);
});
```

**설명**:

1. 단일 일정 (repeat.type === 'none') 수정
2. "일정 추가" 버튼 클릭
3. 다이얼로그가 표시되지 않음 확인
4. 바로 `PUT /api/events/:id` 호출됨 확인

**예상 결과 (Red Phase 또는 Green Phase)**:

- ✅ PASS: 기존 기능은 정상 작동

---

### 2.5 TC-005: 반복 아이콘 제거

**핵심 로직**:

```typescript
// "예" 클릭하여 단일 수정
await user.click(yesButton);

// 수정된 일정에 반복 아이콘이 없는지 확인
await waitFor(() => {
  const eventList = screen.getByTestId('event-list');
  const specialMeeting = within(eventList).getByText('특별 회의');
  const eventItem = specialMeeting.closest('li');

  // 반복 아이콘이 없어야 함
  expect(within(eventItem!).queryByTestId('RepeatIcon')).not.toBeInTheDocument();
});
```

**설명**:

1. 반복 일정 수정 → "예" 선택
2. 수정된 일정의 RepeatIcon이 제거되었는지 확인

**예상 결과 (Red Phase)**:

- ❌ FAIL: 아이콘 제거 로직 없음

---

### 2.6 TC-006: 반복 아이콘 유지

**핵심 로직**:

```typescript
// "아니오" 클릭하여 전체 수정
await user.click(noButton);

// 모든 일정에 반복 아이콘이 유지되는지 확인
await waitFor(() => {
  const eventList = screen.getByTestId('event-list');
  const teamMeetings = within(eventList).getAllByText('팀 미팅');

  teamMeetings.forEach((meeting) => {
    const eventItem = meeting.closest('li');
    expect(within(eventItem!).getByTestId('RepeatIcon')).toBeInTheDocument();
  });
});
```

**설명**:

1. 반복 일정 수정 → "아니오" 선택
2. 모든 반복 일정의 RepeatIcon이 유지되는지 확인

**예상 결과 (Red Phase)**:

- ❌ FAIL: 전체 수정 로직 없음

---

### 2.7 TC-007: 다이얼로그 취소

**핵심 로직**:

```typescript
// 다이얼로그 표시
const dialog = await screen.findByRole('dialog');
expect(dialog).toBeInTheDocument();

// ESC 키 누르기
await user.keyboard('{Escape}');

// 다이얼로그 닫힘 확인
await waitFor(() => {
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

// API 호출되지 않음 확인
expect(apiCalled).toBe(false);

// 일정이 수정되지 않았는지 확인
const eventList = screen.getByTestId('event-list');
expect(within(eventList).getByText('주간 회의')).toBeInTheDocument();
expect(within(eventList).queryByText('수정 시도')).not.toBeInTheDocument();
```

**설명**:

1. 반복 일정 수정 시도
2. 다이얼로그 표시
3. ESC 키로 취소
4. API 호출 없음 확인
5. 일정이 수정되지 않았는지 확인

**예상 결과 (Red Phase)**:

- ❌ FAIL: 다이얼로그 없음

---

## 3. MSW 핸들러 추가

### 3.1 `PUT /api/recurring-events/:repeatId` 핸들러

**파일**: `src/__mocks__/handlers.ts`

**추가 코드**:

```typescript
http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
  const { repeatId } = params;
  const updateData = (await request.json()) as Partial<Event>;
  const seriesEvents = mockEvents.filter((event) => event.repeat.id === repeatId);

  if (seriesEvents.length === 0) {
    return new HttpResponse('Recurring series not found', { status: 404 });
  }

  mockEvents = mockEvents.map((event) => {
    if (event.repeat.id === repeatId) {
      return {
        ...event,
        title: updateData.title !== undefined ? updateData.title : event.title,
        description: updateData.description !== undefined ? updateData.description : event.description,
        location: updateData.location !== undefined ? updateData.location : event.location,
        category: updateData.category !== undefined ? updateData.category : event.category,
        notificationTime:
          updateData.notificationTime !== undefined ? updateData.notificationTime : event.notificationTime,
        startTime: updateData.startTime !== undefined ? updateData.startTime : event.startTime,
        endTime: updateData.endTime !== undefined ? updateData.endTime : event.endTime,
      };
    }
    return event;
  });

  return HttpResponse.json(seriesEvents);
}),
```

**설명**:

- `repeatId`로 같은 시리즈의 모든 일정을 찾아 업데이트
- 변경된 필드만 업데이트 (undefined가 아닌 경우만)
- 시간/제목/설명/위치/카테고리/알림시간 동기화

---

## 4. 테스트 데이터

### 4.1 Mock 반복 일정

```typescript
const mockRecurringEvents: Event[] = [
  {
    id: 'recurring-1',
    title: '주간 회의',
    date: '2025-11-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-123' },
    notificationTime: 10,
  },
  {
    id: 'recurring-2',
    title: '주간 회의',
    date: '2025-11-08',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-123' },
    notificationTime: 10,
  },
];
```

### 4.2 Mock 단일 일정

```typescript
const mockSingleEvent: Event = {
  id: 'single-1',
  title: '점심 약속',
  date: '2025-11-05',
  startTime: '12:00',
  endTime: '13:00',
  description: '동료와 점심',
  location: '식당',
  category: '개인',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};
```

---

## 5. 테스트 실행 명령어

```bash
# 전체 테스트 실행
pnpm run test

# 특정 테스트 파일만 실행
pnpm run test src/__tests__/medium.repeatEventEdit.spec.tsx
```

---

## 6. 예상 Red Phase 결과

```
FAIL src/__tests__/medium.repeatEventEdit.spec.tsx
  반복 일정 수정
    TC-001: 다이얼로그 표시
      ✕ 반복 일정 수정 시 선택 다이얼로그가 표시되어야 한다
    TC-002: "예" 선택 - 단일 수정
      ✕ "예"를 선택하면 해당 일정만 단일 일정으로 변환되어 수정되어야 한다
    TC-003: "아니오" 선택 - 전체 수정
      ✕ "아니오"를 선택하면 같은 시리즈의 모든 일정이 수정되어야 한다
    TC-004: 단일 일정 수정
      ✓ 단일 일정 수정 시 다이얼로그가 표시되지 않아야 한다
    TC-005: 반복 아이콘 제거
      ✕ "예" 선택 후 수정된 일정의 반복 아이콘이 제거되어야 한다
    TC-006: 반복 아이콘 유지
      ✕ "아니오" 선택 후 모든 일정의 반복 아이콘이 유지되어야 한다
    TC-007: 다이얼로그 취소
      ✕ 다이얼로그를 취소하면 수정이 취소되어야 한다

Tests failed: 6 failed, 1 passed, 7 total
```

---

## 7. 테스트 구현 세부사항

### 7.1 React Testing Library 쿼리 사용

- `findByRole('dialog')`: 다이얼로그 찾기 (비동기)
- `getByText()`: 텍스트 내용으로 요소 찾기
- `getByLabelText()`: 레이블로 입력 필드 찾기
- `queryByRole()`: 요소가 없을 때 null 반환 (존재하지 않음 확인용)
- `within()`: 특정 컨테이너 내에서만 검색

### 7.2 userEvent 사용

- `click()`: 클릭 이벤트
- `clear()`: 입력 필드 초기화
- `type()`: 텍스트 입력
- `keyboard()`: 키보드 입력 (ESC 등)

### 7.3 MSW를 통한 API 모킹

- `server.use()`: 특정 테스트에서만 사용할 핸들러 추가
- `http.get()`, `http.put()`: HTTP 메서드별 핸들러
- `HttpResponse.json()`: JSON 응답 반환

---

## 8. 참조 문서

- `test_spec.md`: 테스트 설계 명세서
- `feature_spec.md`: 기능 명세서
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- MSW: https://mswjs.io/docs/

---

## 9. 체크리스트 (Poseidon)

- [x] 모든 테스트 케이스를 코드로 구현했는가?
- [x] 테스트가 TDD Red Phase에 적합한가? (실패해야 함)
- [x] 테스트 코드가 명확하고 읽기 쉬운가?
- [x] Mock 데이터가 충분한가?
- [x] MSW 핸들러가 올바르게 설정되었는가?
- [x] API 호출 검증이 포함되었는가?
- [x] 비동기 처리가 올바른가? (waitFor, findBy 사용)
- [x] 테스트 간 독립성이 보장되는가? (beforeEach, resetMockEvents)
- [x] 테스트 실행 명령어를 문서화했는가?
- [x] 예상 Red Phase 결과를 명시했는가?
