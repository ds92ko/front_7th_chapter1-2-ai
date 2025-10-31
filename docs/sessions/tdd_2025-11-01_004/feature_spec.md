# 기능 명세서: 반복 일정 삭제 (단일/전체 선택)

**작성자**: Athena (기능 명세 작성자)  
**작성일**: 2025-11-01  
**Session ID**: tdd_2025-11-01_004

---

## 1. 기능 개요

### 1.1 목적

- 반복 일정 삭제 시 사용자가 "해당 일정만" 또는 "전체 시리즈"를 선택할 수 있도록 다이얼로그를 제공하여, 의도하지 않은 전체 삭제를 방지하고 사용자 경험을 개선한다.

### 1.2 배경

- 현재 반복 일정을 삭제하면 해당 일정만 삭제되거나, 전체 시리즈가 삭제되는지 명확하지 않다.
- 사용자가 단일 인스턴스만 삭제하고 싶을 때와 전체 시리즈를 삭제하고 싶을 때를 명확히 구분할 수 있어야 한다.
- 반복 일정 수정 기능과 동일한 UX 패턴을 제공하여 일관성을 높인다.

### 1.3 범위

- **변경 대상**: `App.tsx`
- **API**: `DELETE /api/events/:id`, `DELETE /api/recurring-events/:repeatId`
- **UI**: Material-UI Dialog 컴포넌트 활용 (기존 수정 다이얼로그와 동일한 패턴)

---

## 2. 기능 요구사항

### 2.1 필수 요구사항 (Must Have)

#### 2.1.1 다이얼로그 표시 조건

- **조건**: 반복 일정(`event.repeat.type !== 'none'`)을 삭제하려고 할 때
- **위치**: 삭제 버튼 (IconButton with DeleteOutline) 클릭 시
- **내용**: "해당 일정만 삭제하시겠어요?"
- **버튼**: "예", "아니오"

#### 2.1.2 "예" 선택 시 동작 (단일 삭제)

- **동작**:
  1. 선택한 일정만 삭제
  2. `DELETE /api/events/:id` 호출
  3. 해당 일정만 캘린더 및 일정 목록에서 사라짐
- **결과**:
  - 삭제된 일정만 화면에서 제거됨
  - 나머지 반복 시리즈는 영향받지 않고 유지됨

#### 2.1.3 "아니오" 선택 시 동작 (전체 삭제)

- **동작**:
  1. `event.repeat.id`로 같은 시리즈의 모든 일정 식별
  2. `DELETE /api/recurring-events/:repeatId` 호출
  3. 같은 `repeat.id`를 가진 모든 일정이 삭제됨
- **결과**:
  - 모든 반복 일정이 캘린더 및 일정 목록에서 사라짐
  - 반복 시리즈 전체가 제거됨

#### 2.1.4 단일 일정 삭제

- **조건**: `event.repeat.type === 'none'`
- **동작**: 기존과 동일하게 바로 삭제 (다이얼로그 없음)
- **결과**: `DELETE /api/events/:id` 호출

---

## 3. 비기능 요구사항

### 3.1 사용자 경험

- 다이얼로그는 명확하고 직관적이어야 함
- 반복 일정 수정 기능과 동일한 다이얼로그 패턴 사용
- 버튼 레이블이 의도를 분명히 전달해야 함
- 삭제 후 즉시 캘린더에 반영되어야 함

### 3.2 성능

- 전체 삭제 시 API 호출은 1번만 수행 (벌크 삭제)
- 불필요한 리렌더링 최소화

### 3.3 안정성

- 반복 일정 식별 실패 시 에러 처리
- API 호출 실패 시 사용자에게 피드백
- 삭제 후 이벤트 로딩 에러 방지

---

## 4. 사용자 시나리오

### 4.1 시나리오 1: 반복 일정 중 하나만 삭제

1. 사용자가 반복 일정 중 하나의 삭제 버튼 클릭
2. **다이얼로그 표시**: "해당 일정만 삭제하시겠어요?"
3. **"예" 클릭**
4. 해당 일정만 캘린더와 일정 목록에서 사라짐
5. 나머지 반복 일정은 유지됨

### 4.2 시나리오 2: 반복 일정 전체 삭제

1. 사용자가 반복 일정 중 하나의 삭제 버튼 클릭
2. **다이얼로그 표시**: "해당 일정만 삭제하시겠어요?"
3. **"아니오" 클릭**
4. 같은 시리즈의 모든 반복 일정이 캘린더와 일정 목록에서 사라짐
5. 반복 시리즈 전체가 제거됨

### 4.3 시나리오 3: 단일 일정 삭제

1. 사용자가 단일 일정의 삭제 버튼 클릭
2. **다이얼로그 표시 없음**
3. 즉시 해당 일정이 삭제됨

---

## 5. 인터페이스 명세

### 5.1 UI 컴포넌트

#### 5.1.1 다이얼로그 구조 (Material-UI)

```tsx
<Dialog open={isRepeatDeleteDialogOpen} onClose={handleDeleteDialogClose}>
  <DialogTitle>반복 일정 삭제</DialogTitle>
  <DialogContent>
    <DialogContentText>해당 일정만 삭제하시겠어요?</DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleDeleteSingleEvent}>예</Button>
    <Button onClick={handleDeleteAllEvents}>아니오</Button>
  </DialogActions>
</Dialog>
```

### 5.2 API 명세

#### 5.2.1 단일 일정 삭제 (기존 API 활용)

```
DELETE /api/events/:id
```

**서버 동작** (`server.js` 확인 완료):
- 해당 `id`를 가진 일정을 삭제
- 204 No Content 반환

#### 5.2.2 반복 시리즈 전체 삭제 (기존 API 활용)

```
DELETE /api/recurring-events/:repeatId
```

**서버 동작** (`server.js` 확인 완료):
- 같은 `repeat.id`를 가진 모든 일정을 삭제
- 204 No Content 반환

---

## 6. 데이터 흐름

### 6.1 상태 관리

```typescript
// 추가 상태
const [isRepeatDeleteDialogOpen, setIsRepeatDeleteDialogOpen] = useState(false);
const [pendingDeleteEvent, setPendingDeleteEvent] = useState<Event | null>(null);
```

### 6.2 로직 흐름

#### 6.2.1 삭제 시작 시

```typescript
const handleDeleteClick = async (event: Event) => {
  // 반복 일정 삭제인지 확인
  if (event.repeat.type !== 'none') {
    // 다이얼로그 표시
    setPendingDeleteEvent(event);
    setIsRepeatDeleteDialogOpen(true);
  } else {
    // 단일 일정 즉시 삭제
    await deleteEvent(event.id);
  }
};
```

#### 6.2.2 "예" 선택 (단일 삭제)

```typescript
const handleDeleteSingleEvent = async () => {
  if (!pendingDeleteEvent) return;

  await deleteEvent(pendingDeleteEvent.id); // DELETE /api/events/:id
  setIsRepeatDeleteDialogOpen(false);
  setPendingDeleteEvent(null);
};
```

#### 6.2.3 "아니오" 선택 (전체 삭제)

```typescript
const handleDeleteAllEvents = async () => {
  if (!pendingDeleteEvent?.repeat?.id) return;

  const repeatId = pendingDeleteEvent.repeat.id;
  try {
    const response = await fetch(`/api/recurring-events/${repeatId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete recurring events');
    }

    await fetchEvents(); // 이벤트 목록 새로고침
    enqueueSnackbar('반복 일정이 삭제되었습니다.', { variant: 'info' });
  } catch (error) {
    console.error('Error deleting recurring events:', error);
    enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
  }

  setIsRepeatDeleteDialogOpen(false);
  setPendingDeleteEvent(null);
};
```

---

## 7. 테스트 요구사항

### 7.1 단위 테스트

- 다이얼로그 표시 조건 테스트
- "예" 선택 시 단일 삭제 로직 테스트
- "아니오" 선택 시 전체 삭제 로직 테스트
- 단일 일정 삭제 시 다이얼로그 미표시 테스트

### 7.2 통합 테스트

- 반복 일정 삭제 전체 플로우 테스트
- API 호출 검증 (MSW 활용)
- 캘린더 UI 업데이트 확인
- 일정 목록에서 삭제 확인

### 7.3 엣지 케이스

- `repeat.id`가 없는 경우 에러 처리
- API 실패 시 에러 처리
- 다이얼로그 취소 시 동작

---

## 8. 제약사항 및 가정

### 8.1 제약사항

- Material-UI Dialog 컴포넌트 사용
- 기존 API 구조 활용 (`DELETE /api/events/:id`, `DELETE /api/recurring-events/:repeatId`)
- date-fns 등 외부 라이브러리 사용 금지
- 기존 코드 최소 수정 (반복 일정 수정 기능과 동일한 패턴 활용)

### 8.2 가정

- `repeat.id`가 모든 반복 일정 인스턴스에 동일하게 설정되어 있음
- 서버 API는 `DELETE /api/recurring-events/:repeatId`를 통해 벌크 삭제 지원
- `useEventOperations` 훅의 `deleteEvent` 함수는 이미 존재하며 수정 불필요

---

## 9. 성공 기준

### 9.1 구현 완료 기준

- [ ] 반복 일정 삭제 시 다이얼로그 표시
- [ ] "예" 선택 시 단일 일정만 삭제
- [ ] "아니오" 선택 시 전체 시리즈 삭제
- [ ] 단일 일정은 기존처럼 바로 삭제
- [ ] 모든 테스트 통과
- [ ] 캘린더 UI에 정상 반영
- [ ] 일정 목록에 정상 반영
- [ ] 삭제 후 이벤트 로딩 에러 없음

### 9.2 품질 기준

- [ ] 코드 변경 최소화
- [ ] 기존 기능 영향 없음 (회귀 없음)
- [ ] ESLint, Prettier 규칙 준수
- [ ] 테스트 커버리지 유지

---

## 10. 위험 요소 및 대응 방안

### 10.1 위험 요소

- **상태 관리**: 다이얼로그 상태와 삭제할 이벤트 데이터 동기화
- **API 응답 형식**: 서버 API 응답이 예상과 다를 수 있음
- **이벤트 로딩 에러**: 삭제 후 캘린더 업데이트 시 에러 발생 가능

### 10.2 대응 방안

- **상태 관리**: `pendingDeleteEvent`로 임시 저장하여 격리 (수정 기능과 동일한 패턴)
- **API 응답**: `server.js` 코드 확인 완료, MSW 모킹으로 테스트
- **이벤트 로딩**: 삭제 후 `fetchEvents()` 호출하여 최신 상태 반영

---

## 11. 참조 문서

- `server.js`: API 구조 확인 (`DELETE /api/recurring-events/:repeatId` 존재 확인)
- `App.tsx`: 기존 삭제 로직 및 반복 일정 수정 다이얼로그 패턴
- `useEventOperations.ts`: 기존 `deleteEvent` 함수
- Material-UI Dialog: https://mui.com/material-ui/react-dialog/
- 반복 일정 수정 기능 명세: `docs/sessions/tdd_2025-11-01_003/feature_spec.md`

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

