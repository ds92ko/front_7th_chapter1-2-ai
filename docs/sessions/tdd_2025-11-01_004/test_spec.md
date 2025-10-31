# 테스트 명세서: 반복 일정 삭제 (단일/전체 선택)

**작성자**: Artemis (테스트 설계자)  
**작성일**: 2025-11-01  
**Session ID**: tdd_2025-11-01_004  
**참조 문서**: `feature_spec.md`

---

## 1. 테스트 전략

### 1.1 테스트 목표

- 반복 일정 삭제 시 다이얼로그가 올바르게 표시되는지 검증
- "예" 선택 시 단일 일정만 삭제되는지 검증
- "아니오" 선택 시 전체 시리즈가 삭제되는지 검증
- 단일 일정 삭제 시 다이얼로그가 표시되지 않는지 검증
- API 호출이 올바르게 이루어지는지 검증

### 1.2 테스트 범위

- **포함**:
  - 다이얼로그 표시 로직
  - 단일/전체 삭제 로직
  - API 호출 검증
  - UI 업데이트 확인
  - 삭제 후 이벤트 로딩 에러 방지
- **제외**:
  - 서버 측 삭제 로직
  - 반복 일정 생성 로직 (기존 테스트 커버)

### 1.3 테스트 레벨

- **통합 테스트**: 전체 플로우 검증 (Medium)
- **단위 테스트**: 필요시 추가

---

## 2. 테스트 케이스

### 2.1 통합 테스트: 반복 일정 삭제 플로우

#### TC-001: 반복 일정 삭제 시 다이얼로그 표시

**목적**: 반복 일정을 삭제하려고 할 때 선택 다이얼로그가 표시되는지 검증

**전제 조건**:

- 반복 일정이 1개 이상 존재 (repeat.type !== 'none')

**테스트 단계**:

1. Mock 데이터로 반복 일정 생성 (매주 반복, repeat.id 있음)
2. App 컴포넌트 렌더링
3. 반복 일정의 삭제 버튼 클릭
4. 다이얼로그 표시 확인: "해당 일정만 삭제하시겠어요?"
5. "예", "아니오" 버튼 존재 확인

**예상 결과**:

- 다이얼로그가 표시됨
- "해당 일정만 삭제하시겠어요?" 텍스트 존재
- "예", "아니오" 버튼 존재

**중요도**: High  
**우선순위**: P0

---

#### TC-002: "예" 선택 시 단일 일정만 삭제

**목적**: "예"를 선택하면 해당 일정만 삭제되는지 검증

**전제 조건**:

- 반복 일정 3개 존재 (2025-11-01, 2025-11-08, 2025-11-15, 모두 같은 repeat.id)
- 다이얼로그가 표시된 상태

**테스트 단계**:

1. Mock 반복 일정 생성 (매주 금요일, repeat.id = "repeat-123")
   - 일정 3개: 2025-11-01, 2025-11-08, 2025-11-15
2. App 렌더링
3. 첫 번째 일정 (2025-11-01) 삭제 버튼 클릭
4. 다이얼로그에서 **"예" 클릭**
5. API 호출 확인: `DELETE /api/events/:id` (해당 일정 ID)
6. 캘린더 확인:
   - 2025-11-01 일정이 사라짐
   - 2025-11-08, 2025-11-15는 여전히 존재
   - 남은 일정들은 반복 아이콘 유지
7. 일정 목록 확인:
   - 2025-11-01 일정이 목록에서 사라짐
   - 2025-11-08, 2025-11-15는 목록에 표시

**예상 결과**:

- `DELETE /api/events/:id` 호출됨
- 해당 일정만 삭제됨
- 나머지 반복 일정은 영향받지 않음
- 이벤트 로딩 에러 없음

**중요도**: High  
**우선순위**: P0

---

#### TC-003: "아니오" 선택 시 전체 시리즈 삭제

**목적**: "아니오"를 선택하면 같은 시리즈의 모든 일정이 삭제되는지 검증

**전제 조건**:

- 반복 일정 3개 존재 (2025-11-01, 2025-11-08, 2025-11-15, 모두 같은 repeat.id)
- 다이얼로그가 표시된 상태

**테스트 단계**:

1. Mock 반복 일정 생성 (매주 금요일, repeat.id = "repeat-456")
   - 일정 3개: 2025-11-01, 2025-11-08, 2025-11-15
2. App 렌더링
3. 두 번째 일정 (2025-11-08) 삭제 버튼 클릭
4. 다이얼로그에서 **"아니오" 클릭**
5. API 호출 확인: `DELETE /api/recurring-events/repeat-456`
6. 캘린더 확인:
   - 모든 반복 일정 (2025-11-01, 2025-11-08, 2025-11-15) 사라짐
7. 일정 목록 확인:
   - 모든 반복 일정이 목록에서 사라짐

**예상 결과**:

- `DELETE /api/recurring-events/:repeatId` 호출됨
- 같은 `repeat.id`를 가진 모든 일정 삭제됨
- 이벤트 로딩 에러 없음

**중요도**: High  
**우선순위**: P0

---

#### TC-004: 단일 일정 삭제 시 다이얼로그 미표시

**목적**: 단일 일정(repeat.type === 'none')을 삭제할 때 다이얼로그가 표시되지 않는지 검증

**전제 조건**:

- 단일 일정 1개 존재 (repeat.type === 'none')

**테스트 단계**:

1. Mock 단일 일정 생성
2. App 렌더링
3. 단일 일정의 삭제 버튼 클릭
4. 다이얼로그가 표시되지 않음 확인
5. API 호출 확인: `DELETE /api/events/:id`
6. 일정이 즉시 사라짐 확인

**예상 결과**:

- 다이얼로그가 표시되지 않음
- `DELETE /api/events/:id` 즉시 호출됨
- 일정이 캘린더와 목록에서 사라짐

**중요도**: High  
**우선순위**: P0

---

#### TC-005: 다이얼로그 취소 시 동작

**목적**: 다이얼로그를 취소하면 삭제가 취소되는지 검증

**전제 조건**:

- 반복 일정 존재
- 삭제 다이얼로그가 표시된 상태

**테스트 단계**:

1. Mock 반복 일정 생성
2. App 렌더링
3. 반복 일정 삭제 버튼 클릭
4. 다이얼로그 표시 확인
5. 다이얼로그 외부 클릭 또는 ESC 키 (취소)
6. API 호출이 없었는지 확인
7. 일정이 여전히 존재하는지 확인

**예상 결과**:

- API 호출 없음
- 모든 일정이 그대로 유지됨
- 다이얼로그가 닫힘

**중요도**: Medium  
**우선순위**: P1

---

#### TC-006: 다이얼로그 연속 작동 확인

**목적**: 다이얼로그를 여러 번 열고 닫아도 정상 작동하는지 검증

**전제 조건**:

- 반복 일정 2개 이상 존재

**테스트 단계**:

1. Mock 반복 일정 2세트 생성 (다른 repeat.id)
2. App 렌더링
3. 첫 번째 시리즈의 일정 삭제 버튼 클릭
4. 다이얼로그 표시 확인
5. "예" 클릭하여 단일 삭제
6. 두 번째 시리즈의 일정 삭제 버튼 클릭
7. 다이얼로그 다시 표시 확인
8. "아니오" 클릭하여 전체 삭제
9. 올바른 API 호출 확인

**예상 결과**:

- 다이얼로그가 매번 정상 작동
- 각 삭제가 올바르게 처리됨
- 상태 충돌 없음

**중요도**: Medium  
**우선순위**: P1

---

#### TC-007: API 실패 시 에러 처리

**목적**: 삭제 API 호출이 실패할 때 에러가 올바르게 처리되는지 검증

**전제 조건**:

- 반복 일정 존재
- 삭제 API가 실패하도록 MSW 설정

**테스트 단계**:

1. Mock 반복 일정 생성
2. MSW에서 `DELETE /api/recurring-events/:repeatId`가 404 반환하도록 설정
3. App 렌더링
4. 반복 일정 삭제 버튼 클릭
5. "아니오" 클릭
6. 에러 토스트 메시지 확인: "일정 삭제 실패"
7. 일정이 여전히 존재하는지 확인

**예상 결과**:

- 에러 토스트 표시됨
- 일정이 삭제되지 않고 유지됨
- 애플리케이션이 정상 작동함

**중요도**: Medium  
**우선순위**: P2

---

## 3. MSW Mock 설정

### 3.1 단일 일정 삭제

```typescript
server.use(
  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    // Mock 데이터에서 삭제 처리
    return new HttpResponse(null, { status: 204 });
  })
);
```

### 3.2 반복 시리즈 전체 삭제

```typescript
server.use(
  http.delete('/api/recurring-events/:repeatId', ({ params }) => {
    const { repeatId } = params;
    // repeatId와 일치하는 모든 일정 삭제 처리
    return new HttpResponse(null, { status: 204 });
  })
);
```

### 3.3 삭제 실패 시뮬레이션

```typescript
server.use(
  http.delete('/api/recurring-events/:repeatId', () => {
    return new HttpResponse('Recurring series not found', { status: 404 });
  })
);
```

---

## 4. 테스트 데이터

### 4.1 반복 일정 Mock 데이터

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
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-11-30',
      id: 'repeat-123',
    },
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
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-11-30',
      id: 'repeat-123',
    },
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
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-11-30',
      id: 'repeat-123',
    },
    notificationTime: 10,
  },
];
```

### 4.2 단일 일정 Mock 데이터

```typescript
const mockSingleEvent: Event = {
  id: 'single-1',
  title: '점심 약속',
  date: '2025-11-10',
  startTime: '12:00',
  endTime: '13:00',
  description: '동료와 점심',
  location: '식당',
  category: '개인',
  repeat: {
    type: 'none',
    interval: 0,
  },
  notificationTime: 10,
};
```

---

## 5. 테스트 환경 설정

### 5.1 필요한 라이브러리

- `@testing-library/react`: UI 렌더링 및 상호작용
- `@testing-library/user-event`: 사용자 이벤트 시뮬레이션
- `vitest`: 테스트 프레임워크
- `msw`: API 모킹

### 5.2 Setup

```typescript
import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../setupTests';

const setup = (element: ReactElement) => {
  const user = userEvent.setup();
  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};
```

---

## 6. 테스트 실행 및 검증

### 6.1 테스트 실행 명령

```bash
npm run test
```

### 6.2 예상 테스트 결과 (Red 단계)

- **TC-001 ~ TC-007**: ❌ 실패 (구현되지 않음)

### 6.3 구현 후 예상 결과 (Green 단계)

- **TC-001 ~ TC-007**: ✅ 통과

---

## 7. 커버리지 목표

### 7.1 코드 커버리지

- **목표**: 90% 이상
- **대상**: 
  - 삭제 다이얼로그 표시 로직
  - 단일/전체 삭제 로직
  - API 호출 부분

### 7.2 기능 커버리지

- **다이얼로그 표시**: 100%
- **단일 삭제**: 100%
- **전체 삭제**: 100%
- **에러 처리**: 100%

---

## 8. 테스트 체크리스트 (Artemis)

- [x] 모든 주요 기능에 대한 테스트 케이스가 정의되었는가?
- [x] 각 테스트 케이스는 명확한 목적과 예상 결과를 가지는가?
- [x] 엣지 케이스 및 에러 시나리오가 포함되었는가?
- [x] 테스트 데이터가 충분히 정의되었는가?
- [x] MSW Mock 설정이 명확히 정의되었는가?
- [x] 테스트 우선순위가 적절히 지정되었는가?
- [x] 각 테스트는 독립적으로 실행 가능한가?
- [x] TDD Red-Green-Refactor 사이클에 부합하는가?
- [x] 기존 테스트에 영향을 주지 않는가?
- [x] 성공 기준이 측정 가능하게 정의되었는가?

---

## 9. 참조 문서

- `feature_spec.md`: 기능 명세서
- `App.tsx`: 삭제 버튼 및 다이얼로그 구현 위치
- `server.js`: API 명세
- 반복 일정 수정 테스트: `docs/sessions/tdd_2025-11-01_003/test_spec.md`

