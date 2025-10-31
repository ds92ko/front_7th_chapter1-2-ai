# 테스트 명세서: 반복 일정 수정 (단일/전체 선택)

**작성자**: Artemis (테스트 설계자)  
**작성일**: 2025-10-31  
**Session ID**: tdd_2025-11-01_003  
**참조 문서**: `feature_spec.md`

---

## 1. 테스트 전략

### 1.1 테스트 목표

- 반복 일정 수정 시 다이얼로그가 올바르게 표시되는지 검증
- "예" 선택 시 단일 일정으로 변환되어 수정되는지 검증
- "아니오" 선택 시 전체 시리즈가 수정되는지 검증
- 단일 일정 수정 시 다이얼로그가 표시되지 않는지 검증
- API 호출이 올바르게 이루어지는지 검증

### 1.2 테스트 범위

- **포함**:
  - 다이얼로그 표시 로직
  - 단일/전체 수정 로직
  - API 호출 검증
  - UI 업데이트 확인
- **제외**:
  - 서버 측 반복 일정 생성 로직
  - 날짜 계산 로직 (기존 테스트 커버)

### 1.3 테스트 레벨

- **통합 테스트**: 전체 플로우 검증 (Medium)
- **단위 테스트**: 필요시 추가

---

## 2. 테스트 케이스

### 2.1 통합 테스트: 반복 일정 수정 플로우

#### TC-001: 반복 일정 수정 시 다이얼로그 표시

**목적**: 반복 일정을 수정하려고 할 때 선택 다이얼로그가 표시되는지 검증

**전제 조건**:

- 반복 일정이 1개 이상 존재 (repeat.type !== 'none')
- 사용자가 반복 일정 수정 폼을 열었음

**테스트 단계**:

1. Mock 데이터로 반복 일정 생성 (매주 반복, repeat.id 있음)
2. App 컴포넌트 렌더링
3. 반복 일정 중 하나 클릭하여 수정 폼 열기
4. 제목을 "팀 회의"에서 "긴급 팀 회의"로 변경
5. "일정 추가" 버튼 클릭
6. 다이얼로그 표시 확인: "해당 일정만 수정하시겠어요?"
7. "예", "아니오" 버튼 존재 확인

**예상 결과**:

- 다이얼로그가 표시됨
- "해당 일정만 수정하시겠어요?" 텍스트 존재
- "예", "아니오" 버튼 존재

**중요도**: High  
**우선순위**: P0

---

#### TC-002: "예" 선택 시 단일 일정으로 변환 및 수정

**목적**: "예"를 선택하면 해당 일정만 단일 일정으로 변환되어 수정되는지 검증

**전제 조건**:

- 반복 일정 3개 존재 (2025-11-01, 2025-11-08, 2025-11-15, 모두 같은 repeat.id)
- 다이얼로그가 표시된 상태

**테스트 단계**:

1. Mock 반복 일정 생성 (매주 금요일, repeat.id = "repeat-123")
2. App 렌더링
3. 첫 번째 일정 (2025-11-01) 클릭하여 수정
4. 제목을 "주간 회의"에서 "특별 회의"로 변경
5. "일정 추가" 버튼 클릭
6. 다이얼로그에서 **"예" 클릭**
7. API 호출 확인: `PUT /api/events/:id`
8. Request body 확인:
   - `repeat.type`이 `'none'`으로 설정되었는지
   - 제목이 "특별 회의"로 변경되었는지
9. 캘린더 확인:
   - 2025-11-01 일정만 "특별 회의"로 표시
   - 2025-11-08, 2025-11-15는 "주간 회의"로 유지
   - 2025-11-01 일정에 반복 아이콘 없음
   - 2025-11-08, 2025-11-15는 반복 아이콘 유지

**예상 결과**:

- `PUT /api/events/:id` 호출됨
- 해당 일정만 수정됨
- `repeat.type`이 `'none'`으로 변경됨
- 나머지 반복 일정은 영향받지 않음

**중요도**: High  
**우선순위**: P0

---

#### TC-003: "아니오" 선택 시 전체 시리즈 수정

**목적**: "아니오"를 선택하면 같은 시리즈의 모든 일정이 수정되는지 검증

**전제 조건**:

- 반복 일정 3개 존재 (2025-11-01, 2025-11-08, 2025-11-15, 모두 같은 repeat.id)
- 다이얼로그가 표시된 상태

**테스트 단계**:

1. Mock 반복 일정 생성 (매주 금요일, repeat.id = "repeat-456")
   - 제목: "주간 회의"
   - 시간: 10:00-11:00
   - 위치: "회의실 A"
2. App 렌더링
3. 두 번째 일정 (2025-11-08) 클릭하여 수정
4. 데이터 변경:
   - 제목: "주간 회의" → "팀 미팅"
   - 시간: 10:00-11:00 → 14:00-15:00
   - 위치: "회의실 A" → "회의실 B"
5. "일정 추가" 버튼 클릭
6. 다이얼로그에서 **"아니오" 클릭**
7. API 호출 확인: `PUT /api/recurring-events/repeat-456`
8. Request body 확인:
   - `title`: "팀 미팅"
   - `startTime`: "14:00"
   - `endTime`: "15:00"
   - `location`: "회의실 B"
9. 캘린더 확인:
   - 모든 반복 일정 (2025-11-01, 2025-11-08, 2025-11-15) 동기화
   - 제목: "팀 미팅"
   - 시간: 14:00-15:00
   - 위치: "회의실 B"
   - 모든 일정에 반복 아이콘 유지

**예상 결과**:

- `PUT /api/recurring-events/:repeatId` 호출됨
- 같은 `repeat.id`를 가진 모든 일정 수정됨
- 날짜는 각각 유지되고, 시간/제목/위치 등이 동기화됨
- 반복 아이콘 유지

**중요도**: High  
**우선순위**: P0

---

#### TC-004: 단일 일정 수정 시 다이얼로그 미표시

**목적**: 단일 일정을 수정할 때는 다이얼로그가 표시되지 않는지 검증

**전제 조건**:

- 단일 일정 존재 (repeat.type === 'none')

**테스트 단계**:

1. Mock 단일 일정 생성
   - 제목: "점심 약속"
   - repeat.type: 'none'
2. App 렌더링
3. 일정 클릭하여 수정 폼 열기
4. 제목을 "점심 약속"에서 "저녁 약속"으로 변경
5. "일정 추가" 버튼 클릭
6. 다이얼로그가 표시되지 않음 확인
7. API 호출 확인: `PUT /api/events/:id`
8. 캘린더 확인: "저녁 약속"으로 즉시 변경

**예상 결과**:

- 다이얼로그가 표시되지 않음
- `PUT /api/events/:id` 호출됨
- 일정이 즉시 수정됨

**중요도**: High  
**우선순위**: P0

---

#### TC-005: "예" 선택 후 반복 아이콘 제거 확인

**목적**: 단일 수정 후 해당 일정의 반복 아이콘이 제거되는지 검증

**전제 조건**:

- 반복 일정 존재

**테스트 단계**:

1. Mock 반복 일정 생성 (repeat.type = 'weekly', repeat.id 있음)
2. App 렌더링
3. 반복 일정 수정 → "예" 선택
4. 캘린더에서 수정된 일정 확인
5. RepeatIcon이 표시되지 않는지 확인 (data-testid="RepeatIcon")

**예상 결과**:

- 수정된 일정에 RepeatIcon이 없음
- 나머지 반복 일정은 RepeatIcon 유지

**중요도**: Medium  
**우선순위**: P1

---

#### TC-006: "아니오" 선택 후 반복 아이콘 유지 확인

**목적**: 전체 수정 후 모든 일정의 반복 아이콘이 유지되는지 검증

**전제 조건**:

- 반복 일정 존재

**테스트 단계**:

1. Mock 반복 일정 생성 (repeat.type = 'weekly', repeat.id 있음)
2. App 렌더링
3. 반복 일정 수정 → "아니오" 선택
4. 캘린더에서 모든 반복 일정 확인
5. 모든 일정에 RepeatIcon이 표시되는지 확인

**예상 결과**:

- 모든 반복 일정에 RepeatIcon 유지

**중요도**: Medium  
**우선순위**: P1

---

#### TC-007: 다이얼로그 취소 (ESC 키 또는 배경 클릭)

**목적**: 다이얼로그를 취소하면 수정이 취소되는지 검증

**전제 조건**:

- 반복 일정 수정 시도 중
- 다이얼로그 표시됨

**테스트 단계**:

1. Mock 반복 일정 생성
2. App 렌더링
3. 반복 일정 수정 시도
4. 다이얼로그 표시
5. ESC 키 누르기 또는 배경 클릭
6. 다이얼로그 닫힘 확인
7. API 호출되지 않음 확인
8. 일정이 수정되지 않음 확인

**예상 결과**:

- 다이얼로그가 닫힘
- API 호출 없음
- 일정 변경 없음
- 수정 폼은 그대로 유지 (사용자가 다시 수정 가능)

**중요도**: Medium  
**우선순위**: P2

---

### 2.2 엣지 케이스 테스트

#### TC-008: repeat.id가 없는 반복 일정 수정

**목적**: repeat.id가 없는 예외적인 반복 일정 처리

**전제 조건**:

- repeat.type은 'weekly'이지만 repeat.id가 undefined인 일정

**테스트 단계**:

1. Mock 반복 일정 생성 (repeat.id 없음)
2. 수정 시도
3. 다이얼로그 표시 확인
4. "아니오" 선택
5. 에러 처리 또는 단일 수정으로 fallback 확인

**예상 결과**:

- 에러 토스트 표시 또는 단일 수정으로 처리

**중요도**: Low  
**우선순위**: P3

---

#### TC-009: API 호출 실패 시 에러 처리

**목적**: API 호출이 실패할 때 적절한 에러 메시지 표시

**전제 조건**:

- Mock API가 404 또는 500 에러 반환

**테스트 단계**:

1. MSW 핸들러를 404 에러 반환하도록 설정
2. 반복 일정 수정 → "아니오" 선택
3. API 호출 실패
4. 에러 토스트 확인: "일정 저장 실패"

**예상 결과**:

- 에러 토스트 표시
- 일정이 수정되지 않음
- 다이얼로그 닫힘

**중요도**: Medium  
**우선순위**: P2

---

## 3. 테스트 데이터

### 3.1 Mock 반복 일정 데이터

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
  {
    id: 'recurring-3',
    title: '주간 회의',
    date: '2025-11-15',
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

### 3.2 Mock 단일 일정 데이터

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

## 4. 테스트 환경

### 4.1 테스트 도구

- **테스트 프레임워크**: Vitest
- **렌더링 라이브러리**: React Testing Library
- **Assertion 라이브러리**: Vitest의 `expect`
- **Mock 도구**: Mock Service Worker (MSW)

### 4.2 테스트 설정

- **시스템 시간**: `vi.setSystemTime(new Date('2025-11-01'))`
- **Mock API**: MSW handlers 사용
  - `PUT /api/events/:id`
  - `PUT /api/recurring-events/:repeatId`

---

## 5. 테스트 파일 구조

### 5.1 테스트 파일 위치

- **파일 경로**: `src/__tests__/medium.repeatEventEdit.spec.tsx`
- **분류**: Integration Test (Medium)

### 5.2 테스트 파일 구조

```typescript
describe('반복 일정 수정', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-11-01'));
  });

  describe('TC-001: 다이얼로그 표시', () => {
    it('반복 일정 수정 시 선택 다이얼로그가 표시되어야 한다', async () => {
      // 테스트 구현
    });
  });

  describe('TC-002: "예" 선택 - 단일 수정', () => {
    it('"예"를 선택하면 해당 일정만 단일 일정으로 변환되어 수정되어야 한다', async () => {
      // 테스트 구현
    });
  });

  describe('TC-003: "아니오" 선택 - 전체 수정', () => {
    it('"아니오"를 선택하면 같은 시리즈의 모든 일정이 수정되어야 한다', async () => {
      // 테스트 구현
    });
  });

  describe('TC-004: 단일 일정 수정', () => {
    it('단일 일정 수정 시 다이얼로그가 표시되지 않아야 한다', async () => {
      // 테스트 구현
    });
  });

  describe('TC-005: 반복 아이콘 제거', () => {
    it('"예" 선택 후 수정된 일정의 반복 아이콘이 제거되어야 한다', async () => {
      // 테스트 구현
    });
  });

  describe('TC-006: 반복 아이콘 유지', () => {
    it('"아니오" 선택 후 모든 일정의 반복 아이콘이 유지되어야 한다', async () => {
      // 테스트 구현
    });
  });

  describe('TC-007: 다이얼로그 취소', () => {
    it('다이얼로그를 취소하면 수정이 취소되어야 한다', async () => {
      // 테스트 구현
    });
  });
});
```

---

## 6. 테스트 구현 가이드라인

### 6.1 테스트 작성 원칙

1. **명확한 테스트 이름**: 테스트 케이스의 목적이 명확히 드러나도록 작성
2. **단일 책임**: 각 테스트는 하나의 기능만 검증
3. **독립성**: 각 테스트는 다른 테스트에 영향을 주지 않음
4. **반복 가능성**: 언제 실행해도 동일한 결과
5. **빠른 실행**: 불필요한 대기 시간 최소화

### 6.2 React Testing Library 쿼리 우선순위

1. `getByRole`: 버튼, 다이얼로그 등 접근성 role로 찾기
2. `getByText`: 텍스트 내용으로 요소 찾기
3. `getByLabelText`: 레이블을 통해 입력 필드 찾기

### 6.3 다이얼로그 테스트 패턴

```typescript
// 다이얼로그 표시 확인
const dialog = await screen.findByRole('dialog');
expect(dialog).toBeInTheDocument();

// 다이얼로그 내용 확인
expect(within(dialog).getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();

// 버튼 확인
const yesButton = within(dialog).getByRole('button', { name: '예' });
const noButton = within(dialog).getByRole('button', { name: '아니오' });
expect(yesButton).toBeInTheDocument();
expect(noButton).toBeInTheDocument();

// 버튼 클릭
await user.click(yesButton);
```

### 6.4 API 호출 검증 패턴

```typescript
// MSW 핸들러로 API 호출 감시
let apiCalled = false;
let requestBody: any;

server.use(
  http.put('/api/events/:id', async ({ request, params }) => {
    apiCalled = true;
    requestBody = await request.json();
    return HttpResponse.json({ ...requestBody, id: params.id }, { status: 200 });
  })
);

// ... 테스트 실행 ...

// API 호출 확인
expect(apiCalled).toBe(true);
expect(requestBody.repeat.type).toBe('none');
```

---

## 7. 예상 테스트 결과

### 7.1 Red Phase (초기)

- **TC-001**: ❌ FAIL - 다이얼로그가 표시되지 않음
- **TC-002**: ❌ FAIL - 단일 수정 로직 없음
- **TC-003**: ❌ FAIL - 전체 수정 로직 없음
- **TC-004**: ✅ PASS - 기존 기능은 정상 작동
- **TC-005**: ❌ FAIL - 아이콘 제거 로직 없음
- **TC-006**: ❌ FAIL - 전체 수정 로직 없음
- **TC-007**: ❌ FAIL - 다이얼로그 없음

### 7.2 Green Phase (구현 후)

- **TC-001**: ✅ PASS - 다이얼로그 표시됨
- **TC-002**: ✅ PASS - 단일 수정 작동
- **TC-003**: ✅ PASS - 전체 수정 작동
- **TC-004**: ✅ PASS - 단일 일정 바로 수정
- **TC-005**: ✅ PASS - 아이콘 제거됨
- **TC-006**: ✅ PASS - 아이콘 유지됨
- **TC-007**: ✅ PASS - 취소 작동

---

## 8. 테스트 커버리지

### 8.1 커버리지 목표

- **기능 커버리지**: 100% (모든 주요 기능 테스트)
- **엣지 케이스**: 주요 엣지 케이스 커버
- **API 호출**: 모든 API 엔드포인트 검증

### 8.2 커버리지 검증 방법

```bash
pnpm run test:coverage -- src/__tests__/medium.repeatEventEdit.spec.tsx
```

---

## 9. 테스트 실행 계획

### 9.1 실행 순서

1. **P0 테스트 먼저**: TC-001 ~ TC-004
2. **P1 테스트**: TC-005, TC-006
3. **P2 테스트**: TC-007, TC-009

### 9.2 실행 명령어

```bash
# 전체 테스트 실행
pnpm run test

# 특정 테스트 파일만 실행
pnpm run test src/__tests__/medium.repeatEventEdit.spec.tsx

# Watch 모드로 실행
pnpm run test -- --watch
```

---

## 10. 테스트 유지보수 가이드

### 10.1 테스트 실패 시 대응

- **TC-001 실패**: 다이얼로그 표시 로직 확인
- **TC-002 실패**: 단일 수정 API 호출 및 repeat.type 변경 확인
- **TC-003 실패**: 전체 수정 API 호출 확인
- **TC-004 실패**: 다이얼로그 조건 로직 확인

### 10.2 향후 확장 시 고려사항

- 반복 규칙 변경 기능 추가 시 테스트 추가 필요
- 다른 반복 유형(매일, 매월, 매년) 테스트 추가 고려
- E2E 테스트로 실제 사용자 플로우 검증 고려

---

## 11. 참조 문서

- `feature_spec.md`: 기능 명세서
- `server.js`: API 구조
- React Testing Library 문서: https://testing-library.com/docs/react-testing-library/intro/
- Material-UI Dialog 테스트: https://mui.com/material-ui/guides/testing/

---

## 12. 체크리스트 (Artemis)

- [x] 모든 기능 요구사항에 대한 테스트 케이스를 작성했는가?
- [x] 각 테스트 케이스의 목적과 예상 결과가 명확한가?
- [x] 테스트 케이스가 TDD Red-Green-Refactor 사이클에 적합한가?
- [x] 테스트 데이터가 충분하고 다양한가?
- [x] 테스트 환경 및 도구가 명확히 정의되었는가?
- [x] 테스트 구현 가이드라인이 구체적인가?
- [x] 예상 테스트 결과(Red/Green)를 명시했는가?
- [x] 테스트 커버리지 목표가 설정되었는가?
- [x] 테스트 유지보수 가이드가 포함되었는가?
- [x] 문서의 완전성과 명확성을 확인했는가?
