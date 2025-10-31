# 기능 명세서: 반복 일정 수정 (단일/전체 선택)

**작성자**: Athena (기능 명세 작성자)  
**작성일**: 2025-10-31  
**Session ID**: tdd_2025-11-01_003

---

## 1. 기능 개요

### 1.1 목적
- 반복 일정 수정 시 사용자가 "해당 일정만" 또는 "전체 시리즈"를 선택할 수 있도록 다이얼로그를 제공하여, 의도하지 않은 전체 수정을 방지하고 사용자 경험을 개선한다.

### 1.2 배경
- 현재 반복 일정을 수정하면 전체 시리즈가 수정되거나, 의도와 다르게 동작할 수 있다.
- 사용자가 단일 인스턴스만 수정하고 싶을 때와 전체 시리즈를 수정하고 싶을 때를 명확히 구분할 수 있어야 한다.

### 1.3 범위
- **변경 대상**: `App.tsx`, `useEventOperations.ts`
- **API**: `PUT /api/events/:id`, `PUT /api/recurring-events/:repeatId`
- **UI**: Material-UI Dialog 컴포넌트 활용

---

## 2. 기능 요구사항

### 2.1 필수 요구사항 (Must Have)

#### 2.1.1 다이얼로그 표시 조건
- **조건**: 반복 일정(`event.repeat.type !== 'none'`)을 수정하려고 할 때
- **위치**: "일정 추가" (실제로는 수정) 버튼 클릭 시
- **내용**: "해당 일정만 수정하시겠어요?"
- **버튼**: "예", "아니오"

#### 2.1.2 "예" 선택 시 동작 (단일 수정)
- **동작**:
  1. 선택한 일정을 단일 일정으로 변환
  2. `repeat.type`을 `'none'`으로 설정
  3. `repeat.id`는 제거 (undefined)
  4. `PUT /api/events/:id` 호출
  5. 해당 일정만 수정됨
- **결과**:
  - 수정된 일정은 반복 아이콘이 사라짐
  - 나머지 반복 시리즈는 영향받지 않음
  - 수정된 일정은 독립적인 단일 일정이 됨

#### 2.1.3 "아니오" 선택 시 동작 (전체 수정)
- **동작**:
  1. `event.repeat.id`로 같은 시리즈의 모든 일정 식별
  2. 수정된 데이터를 모든 인스턴스에 적용
  3. `PUT /api/recurring-events/:repeatId` 호출
  4. 같은 `repeat.id`를 가진 모든 일정이 수정됨
- **결과**:
  - 모든 반복 일정의 제목, 설명, 위치, 카테고리, 알림시간이 동기화됨
  - **날짜와 시간 동기화**:
    - 시작 시간이 변경되면 모든 인스턴스의 시작 시간 변경
    - 종료 시간이 변경되면 모든 인스턴스의 종료 시간 변경
    - 날짜가 변경되면 모든 인스턴스의 날짜가 변경 (각 인스턴스의 날짜 패턴은 유지하되, 시작점 이동)
  - 반복 아이콘 유지
  - `repeat.type`, `repeat.interval`, `repeat.endDate` 유지

#### 2.1.4 단일 일정 수정
- **조건**: `event.repeat.type === 'none'`
- **동작**: 기존과 동일하게 바로 수정 (다이얼로그 없음)
- **결과**: `PUT /api/events/:id` 호출

---

## 3. 비기능 요구사항

### 3.1 사용자 경험
- 다이얼로그는 명확하고 직관적이어야 함
- 버튼 레이블이 의도를 분명히 전달해야 함
- 수정 후 즉시 캘린더에 반영되어야 함

### 3.2 성능
- 전체 수정 시 API 호출은 1번만 수행 (벌크 업데이트)
- 불필요한 리렌더링 최소화

### 3.3 안정성
- 반복 일정 식별 실패 시 에러 처리
- API 호출 실패 시 사용자에게 피드백

---

## 4. 사용자 시나리오

### 4.1 시나리오 1: 반복 일정 중 하나만 수정
1. 사용자가 반복 일정 중 하나를 클릭하여 수정 폼 열기
2. 제목을 "팀 회의"에서 "긴급 팀 회의"로 변경
3. "일정 추가" (수정) 버튼 클릭
4. **다이얼로그 표시**: "해당 일정만 수정하시겠어요?"
5. **"예" 클릭**
6. 해당 일정만 "긴급 팀 회의"로 변경되고 반복 아이콘 사라짐
7. 나머지 반복 일정은 "팀 회의"로 유지

### 4.2 시나리오 2: 반복 일정 전체 수정
1. 사용자가 반복 일정 중 하나를 클릭하여 수정 폼 열기
2. 시작 시간을 10:00에서 11:00으로 변경
3. 위치를 "회의실 A"에서 "회의실 B"로 변경
4. "일정 추가" (수정) 버튼 클릭
5. **다이얼로그 표시**: "해당 일정만 수정하시겠어요?"
6. **"아니오" 클릭**
7. 같은 시리즈의 모든 반복 일정이 11:00 시작, 회의실 B로 변경됨
8. 반복 아이콘 유지

### 4.3 시나리오 3: 단일 일정 수정
1. 사용자가 단일 일정을 클릭하여 수정 폼 열기
2. 제목을 "점심 약속"에서 "저녁 약속"으로 변경
3. "일정 추가" (수정) 버튼 클릭
4. **다이얼로그 표시 없음**
5. 즉시 "저녁 약속"으로 수정됨

---

## 5. 인터페이스 명세

### 5.1 UI 컴포넌트

#### 5.1.1 다이얼로그 구조 (Material-UI)
```tsx
<Dialog open={isRepeatEditDialogOpen} onClose={handleDialogClose}>
  <DialogTitle>반복 일정 수정</DialogTitle>
  <DialogContent>
    <DialogContentText>
      해당 일정만 수정하시겠어요?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleEditSingleEvent}>예</Button>
    <Button onClick={handleEditAllEvents}>아니오</Button>
  </DialogActions>
</Dialog>
```

### 5.2 API 명세

#### 5.2.1 단일 일정 수정 (기존 API 활용)
```
PUT /api/events/:id
Content-Type: application/json

Body:
{
  "id": "event-123",
  "title": "수정된 제목",
  "date": "2025-11-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "description": "수정된 설명",
  "location": "수정된 위치",
  "category": "업무",
  "repeat": {
    "type": "none",
    "interval": 0
  },
  "notificationTime": 10
}
```

#### 5.2.2 반복 시리즈 전체 수정 (기존 API 활용)
```
PUT /api/recurring-events/:repeatId
Content-Type: application/json

Body:
{
  "title": "수정된 제목",
  "description": "수정된 설명",
  "location": "수정된 위치",
  "category": "업무",
  "notificationTime": 10,
  "startTime": "11:00",  // 추가: 시간 동기화
  "endTime": "12:00"      // 추가: 시간 동기화
}
```

**서버 동작** (`server.js` 확인 완료):
- 같은 `repeat.id`를 가진 모든 일정을 찾아 수정
- 각 일정의 날짜는 유지하되, 시간/제목/설명 등 동기화
- `repeat` 정보는 유지

---

## 6. 데이터 흐름

### 6.1 상태 관리
```typescript
// 추가 상태
const [isRepeatEditDialogOpen, setIsRepeatEditDialogOpen] = useState(false);
const [pendingEventData, setPendingEventData] = useState<Event | EventForm | null>(null);
```

### 6.2 로직 흐름

#### 6.2.1 수정 시작 시
```typescript
const handleSaveClick = async () => {
  // 1. 유효성 검사
  if (!title || !date || !startTime || !endTime) {
    enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
    return;
  }

  // 2. 이벤트 데이터 생성
  const eventData = { /* ... */ };

  // 3. 반복 일정 수정인지 확인
  if (editingEvent && editingEvent.repeat.type !== 'none') {
    // 다이얼로그 표시
    setPendingEventData(eventData);
    setIsRepeatEditDialogOpen(true);
  } else {
    // 단일 일정 수정 또는 새 일정 추가
    await saveEvent(eventData);
  }
};
```

#### 6.2.2 "예" 선택 (단일 수정)
```typescript
const handleEditSingleEvent = async () => {
  if (!pendingEventData) return;

  // 반복 정보 제거
  const singleEventData = {
    ...pendingEventData,
    repeat: { type: 'none', interval: 0 }
  };

  await saveEvent(singleEventData, false); // false = 단일 수정
  setIsRepeatEditDialogOpen(false);
  setPendingEventData(null);
};
```

#### 6.2.3 "아니오" 선택 (전체 수정)
```typescript
const handleEditAllEvents = async () => {
  if (!pendingEventData || !editingEvent?.repeat.id) return;

  await saveEvent(pendingEventData, true); // true = 전체 수정
  setIsRepeatEditDialogOpen(false);
  setPendingEventData(null);
};
```

### 6.3 `useEventOperations` 수정
```typescript
const saveEvent = async (eventData: Event | EventForm, editAllRecurring = false) => {
  try {
    let response;
    if (editing) {
      if (editAllRecurring && (eventData as Event).repeat.id) {
        // 반복 시리즈 전체 수정
        const repeatId = (eventData as Event).repeat.id;
        response = await fetch(`/api/recurring-events/${repeatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            category: eventData.category,
            notificationTime: eventData.notificationTime,
            startTime: eventData.startTime,  // 추가
            endTime: eventData.endTime        // 추가
          }),
        });
      } else {
        // 단일 일정 수정
        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }
    } else {
      // 새 일정 추가 (기존 로직)
      // ...
    }
    // ...
  }
};
```

---

## 7. 테스트 요구사항

### 7.1 단위 테스트
- 다이얼로그 표시 조건 테스트
- "예" 선택 시 단일 수정 로직 테스트
- "아니오" 선택 시 전체 수정 로직 테스트
- 단일 일정 수정 시 다이얼로그 미표시 테스트

### 7.2 통합 테스트
- 반복 일정 수정 전체 플로우 테스트
- API 호출 검증 (MSW 활용)
- 캘린더 UI 업데이트 확인

### 7.3 엣지 케이스
- `repeat.id`가 없는 경우 에러 처리
- API 실패 시 에러 처리
- 다이얼로그 취소 시 동작

---

## 8. 제약사항 및 가정

### 8.1 제약사항
- Material-UI Dialog 컴포넌트 사용
- 기존 API 구조 활용 (`PUT /api/events/:id`, `PUT /api/recurring-events/:repeatId`)
- date-fns 등 외부 라이브러리 사용 금지

### 8.2 가정
- `repeat.id`가 모든 반복 일정 인스턴스에 동일하게 설정되어 있음
- 서버 API는 `PUT /api/recurring-events/:repeatId`를 통해 벌크 업데이트 지원
- 반복 일정의 날짜는 서버에서 관리되며, 클라이언트는 시간/제목 등만 업데이트

---

## 9. 성공 기준

### 9.1 구현 완료 기준
- [ ] 반복 일정 수정 시 다이얼로그 표시
- [ ] "예" 선택 시 단일 일정으로 변환 및 수정
- [ ] "아니오" 선택 시 전체 시리즈 수정
- [ ] 단일 일정은 기존처럼 바로 수정
- [ ] 모든 테스트 통과
- [ ] 캘린더 UI에 정상 반영

### 9.2 품질 기준
- [ ] 코드 변경 최소화
- [ ] 기존 기능 영향 없음 (회귀 없음)
- [ ] ESLint, Prettier 규칙 준수
- [ ] 테스트 커버리지 유지

---

## 10. 위험 요소 및 대응 방안

### 10.1 위험 요소
- **날짜 동기화 복잡도**: 반복 일정의 날짜를 변경할 때 로직이 복잡할 수 있음
- **API 응답 형식**: 서버 API 응답이 예상과 다를 수 있음
- **상태 관리**: 다이얼로그 상태와 이벤트 데이터 동기화

### 10.2 대응 방안
- **날짜 동기화**: 서버 API가 처리하므로 클라이언트는 최소 로직만 구현
- **API 응답**: `server.js` 코드 확인 완료, MSW 모킹으로 테스트
- **상태 관리**: `pendingEventData`로 임시 저장하여 격리

---

## 11. 참조 문서
- `server.js`: API 구조 확인
- `useEventOperations.ts`: 기존 저장 로직
- `App.tsx`: 기존 다이얼로그 패턴 (일정 겹침 경고)
- Material-UI Dialog: https://mui.com/material-ui/react-dialog/

---

## 12. 체크리스트 (Athena)

- [x] 기능의 목적과 배경을 명확히 기술했는가?
- [x] 필수 요구사항과 비기능 요구사항을 구분했는가?
- [x] 사용자 시나리오를 구체적으로 작성했는가?
- [x] 인터페이스 변경사항을 코드 수준에서 명시했는가?
- [x] API 명세를 명확히 정의했는가?
- [x] 데이터 흐름을 상세히 기술했는가?
- [x] 테스트 요구사항을 명확히 정의했는가?
- [x] 제약사항과 가정을 문서화했는가?
- [x] 성공 기준을 측정 가능하게 작성했는가?
- [x] 위험 요소와 대응 방안을 고려했는가?
- [x] 문서의 가독성과 완전성을 확인했는가?

