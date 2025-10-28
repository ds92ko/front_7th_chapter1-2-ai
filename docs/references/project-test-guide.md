# 프로젝트 테스트 가이드

> **목적**: 1주차 학습 과정에서 고민했던 테스트 작성 방법론과 주의사항을 정리한 문서입니다.  
> 아르테미스 에이전트가 이 프로젝트의 맥락을 이해하고 일관된 테스트를 설계하도록 돕습니다.

**Version:** 1.0.0  
**Last Updated:** 2025-10-28  
**Context:** React 19 + TypeScript + Vitest 일정 관리 앱

---

## 📋 목차

1. [잘 작성된 테스트란?](#1-잘-작성된-테스트란)
2. [1주차 학습 고민사항](#2-1주차-학습-고민사항)
3. [프로젝트별 테스트 전략](#3-프로젝트별-테스트-전략)
4. [주의사항 (Lessons Learned)](#4-주의사항-lessons-learned)
5. [테스트 계층별 가이드](#5-테스트-계층별-가이드)
6. [실전 예시](#6-실전-예시)

---

## 1. 잘 작성된 테스트란?

### ✅ 좋은 테스트의 5가지 특징

#### 1. **신뢰성 (Reliable)**

- 같은 입력에 항상 같은 결과
- 환경(시간, 네트워크)에 독립적
- Flaky test 없음

```typescript
// ❌ BAD: 실행 시점마다 결과 다름
it('알림을 표시한다', () => {
  const now = new Date(); // 매번 변함
  expect(shouldShowNotification(event, now)).toBe(true); // 불안정
});

// ✅ GOOD: 고정 시간
it('일정 10분 전에 알림을 표시한다', () => {
  vi.setSystemTime(new Date('2025-10-15 08:50:00')); // 고정
  expect(shouldShowNotification(event)).toBe(true);
});
```

---

#### 2. **가독성 (Readable)**

- 6개월 후에도 이해 가능
- 테스트명만 읽어도 의도 파악
- GIVEN-WHEN-THEN 구조 명확

```typescript
// ❌ BAD: 의도 불명확
it('test1', () => {
  const result = fn(2024, 2);
  expect(result).toBe(29);
});

// ✅ GOOD: 의도 명확
it('윤년의 2월에 대해 29일을 반환한다', () => {
  // GIVEN: 윤년 2024년, 2월
  const year = 2024;
  const month = 2;

  // WHEN: 일수 계산
  const result = getDaysInMonth(year, month);

  // THEN: 29일 반환
  expect(result).toBe(29);
});
```

---

#### 3. **유지보수성 (Maintainable)**

- 프로덕션 코드 변경 시 쉽게 수정
- 내부 구현이 아닌 Public API 테스트
- 중복 최소화

```typescript
// ❌ BAD: 내부 구현 의존
it('state를 업데이트한다', () => {
  const { result } = renderHook(() => useEvents());
  expect(result.current._internal_state).toBe('loaded'); // 내부 구현 변경 시 깨짐
});

// ✅ GOOD: Public API 테스트
it('이벤트 로딩 후 리스트에 표시된다', () => {
  render(<EventList />);
  expect(screen.getByText('팀 회의')).toBeInTheDocument(); // 사용자 관점
});
```

---

#### 4. **빠른 실행 (Fast)**

- 전체 테스트 스위트 < 10초
- 외부 의존성 모킹
- 불필요한 대기 제거

```typescript
// ❌ BAD: 실제 API 호출 (느림)
it('이벤트를 가져온다', async () => {
  const events = await fetch('https://api.example.com/events');
  expect(events).toHaveLength(1);
});

// ✅ GOOD: MSW로 모킹 (빠름)
it('이벤트를 가져온다', async () => {
  server.use(http.get('/api/events', () => HttpResponse.json({ events: [mockEvent] })));
  const { result } = renderHook(() => useEventOperations());
  await act(() => Promise.resolve());
  expect(result.current.events).toHaveLength(1);
});
```

---

#### 5. **격리성 (Isolated)**

- 각 테스트는 독립적
- 실행 순서 무관
- 공유 상태 없음

```typescript
// ❌ BAD: 전역 상태 공유
let sharedEvents: Event[] = [];

it('테스트1', () => {
  sharedEvents.push(event1); // 다음 테스트에 영향
});

it('테스트2', () => {
  expect(sharedEvents).toHaveLength(1); // 이전 테스트 의존
});

// ✅ GOOD: beforeEach로 초기화
describe('이벤트 관리', () => {
  let events: Event[];

  beforeEach(() => {
    events = []; // 매번 초기화
  });

  it('이벤트를 추가한다', () => {
    events.push(event1);
    expect(events).toHaveLength(1);
  });

  it('빈 배열의 길이는 0이다', () => {
    expect(events).toHaveLength(0); // 독립적
  });
});
```

---

## 2. 1주차 학습 고민사항

### 🤔 고민 1: "무엇을 테스트해야 하나?"

#### 답변: **Public API (사용자 관점) 우선**

```typescript
// ❌ BAD: 내부 구현 세부사항
it('_calculateDays 함수가 호출된다', () => {
  const spy = vi.spyOn(component, '_calculateDays');
  component.render();
  expect(spy).toHaveBeenCalled(); // 내부 구현
});

// ✅ GOOD: 사용자 관점
it('윤년 2월 29일이 달력에 표시된다', () => {
  vi.setSystemTime(new Date('2024-02-01'));
  render(<Calendar />);
  expect(screen.getByText('29')).toBeInTheDocument(); // 사용자가 보는 것
});
```

**원칙:**

- 사용자가 **보는 것** (UI 요소)
- 사용자가 **하는 것** (클릭, 입력)
- 시스템이 **반환하는 것** (API 응답, 상태 변화)

---

### 🤔 고민 2: "얼마나 많은 테스트를 작성해야 하나?"

#### 답변: **커버리지 목표 달성 + 핵심 엣지 케이스**

```yaml
목표:
  Lines: ≥85%
  Branches: ≥75%

원칙:
  - 핵심 비즈니스 로직은 100% (반복 일정 생성)
  - 에러 처리는 주요 케이스만 (500, 404)
  - 유틸 함수는 경계값만 (윤년, 31일, null)
```

**과도한 테스트 경계:**

```typescript
// ❌ BAD: 의미 없는 테스트
it('변수가 정의된다', () => {
  const x = 1;
  expect(x).toBeDefined(); // 당연함
});

// ✅ GOOD: 의미 있는 테스트
it('잘못된 월 입력 시 에러를 던진다', () => {
  expect(() => getDaysInMonth(2025, 13)).toThrow('Invalid month');
});
```

---

### 🤔 고민 3: "Mock을 언제 사용해야 하나?"

#### 답변: **느린 것, 불안정한 것만 모킹**

```typescript
// ✅ Mock 사용 대상
1. API 호출 (MSW)
2. 시간 (Fake timers)
3. 외부 라이브러리 (vi.mock)
4. 브라우저 API (localStorage, fetch)

// ❌ Mock 금지 대상
1. 순수 함수 (dateUtils, eventOverlap)
2. React 컴포넌트 (실제 렌더링)
3. Custom Hooks (renderHook 사용)
```

**예시:**

```typescript
// ❌ BAD: 순수 함수 모킹
vi.mock('./dateUtils', () => ({
  getDaysInMonth: vi.fn(() => 29), // 실제 로직 테스트 안 됨
}));

// ✅ GOOD: 실제 함수 호출
import { getDaysInMonth } from './dateUtils';
expect(getDaysInMonth(2024, 2)).toBe(29); // 실제 로직 검증
```

---

### 🤔 고민 4: "테스트가 깨지지 않게 하려면?"

#### 답변: **구현이 아닌 계약(Contract) 테스트**

```typescript
// ❌ BAD: 구현 의존
it('배열을 map으로 순회한다', () => {
  const spy = vi.spyOn(Array.prototype, 'map');
  generateRepeatEvents(event, 3);
  expect(spy).toHaveBeenCalled(); // map → forEach 변경 시 깨짐
});

// ✅ GOOD: 결과 검증
it('반복 일정 3개를 생성한다', () => {
  const events = generateRepeatEvents(event, 3);
  expect(events).toHaveLength(3); // 구현 방식 무관
  expect(events[0].date).toBe('2025-10-01');
  expect(events[2].date).toBe('2025-10-03');
});
```

---

### 🤔 고민 5: "Integration vs Unit 테스트 비율은?"

#### 답변: **테스트 피라미드**

```
      /\
     /  \  E2E (Few)
    /----\
   /      \  Integration (Some)
  /--------\
 /          \  Unit (Many)
/____________\

비율 (이 프로젝트):
- Unit: 60% (순수 함수, 유틸)
- Hook: 30% (상태 관리, API)
- Integration: 10% (사용자 흐름)
```

**이유:**

- Unit: 빠르고, 디버깅 쉬움
- Integration: 실제 동작 검증
- E2E: 느리지만 실사용 시나리오 검증

---

## 3. 프로젝트별 테스트 전략

### 🎯 이 프로젝트의 특징

1. **반복 일정 로직 복잡**

   - 윤년 2월 29일 특수 케이스
   - 31일 → 30일 달 변환 불가
   - 단일/전체 수정·삭제 분기

2. **Fake timers 필수**

   - 알림 트리거 정확도 (±1초)
   - 시스템 시간 고정 (2025-10-01)

3. **MSW 활용**

   - 로컬 Express 서버 모킹
   - handlers.ts, handlersUtils.ts 재사용

4. **setupTests.ts 공통 설정**
   - MSW server
   - Fake timers
   - expect.hasAssertions()

---

### 📐 계층별 책임

#### Unit Tests (`src/__tests__/unit/*.spec.ts`)

- **대상**: 순수 함수
- **검증**: 입력 → 출력
- **Mock**: 없음 (실제 호출)

```typescript
// 예시: dateUtils
it('윤년의 2월에 대해 29일을 반환한다', () => {
  expect(getDaysInMonth(2024, 2)).toBe(29);
});
```

---

#### Hook Tests (`src/__tests__/hooks/*.spec.ts`)

- **대상**: Custom Hooks
- **검증**: 상태 변화, API 호출
- **Mock**: MSW, vi.fn()

```typescript
// 예시: useEventOperations
it('네트워크 오류 시 에러 토스트가 표시된다', async () => {
  server.use(http.get('/api/events', () => new HttpResponse(null, { status: 500 })));
  const { result } = renderHook(() => useEventOperations());
  await act(() => Promise.resolve());
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
});
```

---

#### Integration Tests (`src/__tests__/integration/*.integration.spec.tsx`)

- **대상**: 사용자 흐름
- **검증**: Form → API → State → UI
- **Mock**: MSW만 (컴포넌트는 실제 렌더링)

```typescript
// 예시: 일정 추가 흐름
it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다', async () => {
  setupMockHandlerCreation();
  const { user } = setup(<App />);

  await saveSchedule(user, {
    title: '새 회의',
    date: '2025-10-15',
    // ...
  });

  const eventList = within(screen.getByTestId('event-list'));
  expect(eventList.getByText('새 회의')).toBeInTheDocument();
});
```

---

## 4. 주의사항 (Lessons Learned)

### ⚠️ 1. setupTests.ts 중복 설정 주의

**문제:**

```typescript
// setupTests.ts에 이미 있음
beforeEach(() => {
  vi.setSystemTime(new Date('2025-10-01'));
});

// ❌ BAD: 테스트 파일에서 재설정
beforeEach(() => {
  vi.setSystemTime(new Date('2025-10-01')); // 중복!
});
```

**해결:**

```typescript
// ✅ GOOD: 필요한 경우만 개별 설정
it('특정 시간 테스트', () => {
  vi.setSystemTime(new Date('2025-10-15 08:50:00')); // 개별 케이스
  // ...
});
```

---

### ⚠️ 2. expect.hasAssertions() 자동 적용

**상황:**

```typescript
// setupTests.ts
beforeEach(() => {
  expect.hasAssertions(); // 자동 적용됨
});
```

**의미:**

- 각 테스트는 **최소 1개의 expect** 필요
- 비어있는 테스트 방지

```typescript
// ❌ BAD: expect 없음 (실패)
it('테스트', async () => {
  await saveEvent(event); // expect 없음 → 실패
});

// ✅ GOOD: expect 있음
it('테스트', async () => {
  await saveEvent(event);
  expect(result.current.events).toHaveLength(1); // OK
});
```

---

### ⚠️ 3. MSW Handler 재사용

**문제:**

```typescript
// ❌ BAD: 매번 중복 작성
it('테스트1', () => {
  server.use(http.post('/api/events', () => HttpResponse.json({ id: '1' })));
  // ...
});

it('테스트2', () => {
  server.use(http.post('/api/events', () => HttpResponse.json({ id: '1' }))); // 중복
  // ...
});
```

**해결:**

```typescript
// ✅ GOOD: handlersUtils 활용
import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';

it('테스트1', () => {
  setupMockHandlerCreation();
  // ...
});

it('테스트2', () => {
  setupMockHandlerCreation();
  // ...
});
```

---

### ⚠️ 4. Fake timers 시간 진행

**문제:**

```typescript
// ❌ BAD: 실제 대기 (느림)
it('알림 테스트', async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기
  expect(notification).toBeInTheDocument();
});
```

**해결:**

```typescript
// ✅ GOOD: Fake timers로 시간 진행 (빠름)
it('알림 테스트', () => {
  vi.setSystemTime(new Date('2025-10-15 08:49:59'));
  render(<App />);

  expect(screen.queryByText('10분 후')).not.toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(1000); // 1초 진행
  });

  expect(screen.getByText('10분 후')).toBeInTheDocument();
});
```

---

### ⚠️ 5. 반복 일정 겹침 검증 최소화

**배경:**

- 프로젝트 요구사항: 반복 일정끼리 겹침 검증 무시
- 테스트도 1~2개만 존재 확인

```typescript
// ❌ BAD: 과도한 반복 일정 겹침 테스트
it('반복 일정1과 반복 일정2가 겹친다', () => { ... });
it('반복 일정2와 반복 일정3이 겹친다', () => { ... });
it('반복 일정3과 반복 일정4가 겹친다', () => { ... });

// ✅ GOOD: 최소한만
it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', () => {
  // 반복 일정 아닌 일반 케이스만
});
```

---

## 5. 테스트 계층별 가이드

### 📦 Unit Tests

**파일 위치:** `src/__tests__/unit/[module].spec.ts`

**네이밍 규칙:**

- `easy.[module].spec.ts`: 기본 로직
- `medium.[module].spec.ts`: 복잡한 로직
- `hard.[module].spec.ts`: 매우 복잡한 로직

**예시:**

```typescript
// src/__tests__/unit/easy.dateUtils.spec.ts
describe('getDaysInMonth', () => {
  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2023, 2)).toBe(28);
  });
});
```

---

### 🪝 Hook Tests

**파일 위치:** `src/__tests__/hooks/[hook-name].spec.ts`

**네이밍 규칙:**

- `easy.[hook].spec.ts`: 단순 상태 관리
- `medium.[hook].spec.ts`: API 호출 포함
- `hard.[hook].spec.ts`: 복잡한 사이드 이펙트

**예시:**

```typescript
// src/__tests__/hooks/medium.useEventOperations.spec.ts
it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation();

  const { result } = renderHook(() => useEventOperations(false));
  await act(() => Promise.resolve(null));

  const newEvent: Event = {
    /* ... */
  };

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toContainEqual(newEvent);
});
```

---

### 🔗 Integration Tests

**파일 위치:** `src/__tests__/integration/[feature].integration.spec.tsx`

**네이밍 규칙:**

- `[feature].integration.spec.tsx`: 기능별 통합 테스트

**헬퍼 함수:**

```typescript
// 공통 setup
const setup = (element: ReactElement) => {
  const user = userEvent.setup();
  return {
    ...render(
      <ThemeProvider>
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

// 일정 저장 헬퍼
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  await user.click(screen.getAllByText('일정 추가')[0]);
  await user.type(screen.getByLabelText('제목'), form.title);
  // ...
  await user.click(screen.getByTestId('event-submit-button'));
};
```

**예시:**

```typescript
// src/__tests__/integration/event-crud.integration.spec.tsx
describe('일정 CRUD', () => {
  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다', async () => {
    setupMockHandlerCreation();
    const { user } = setup(<App />);

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('새 회의')).toBeInTheDocument();
    expect(eventList.getByText('2025-10-15')).toBeInTheDocument();
  });
});
```

---

## 6. 실전 예시

### 🎯 예시 1: 윤년 2월 29일 반복 일정

**요구사항:**

- 2024-02-29 시작 yearly 반복 일정
- 다음 윤년(2028-02-29)에만 생성
- 평년(2025, 2026, 2027)은 건너뜀

**테스트:**

```typescript
// Unit Test
it('윤년 2월 29일 반복 일정은 다음 윤년에만 생성된다', () => {
  // GIVEN: 2024-02-29 yearly 반복 일정
  const baseEvent = {
    date: '2024-02-29',
    repeat: { type: 'yearly', interval: 1 },
  };

  // WHEN: 5년치 생성
  const events = generateRepeatEvents(baseEvent, 5);

  // THEN: 2024, 2028만 존재 (4년 간격)
  expect(events).toHaveLength(2);
  expect(events[0].date).toBe('2024-02-29');
  expect(events[1].date).toBe('2028-02-29');
});
```

---

### 🎯 예시 2: 알림 트리거 경계

**요구사항:**

- notificationTime=10 (10분 전 알림)
- 일정 시작: 2025-10-15 09:00
- 알림 시간: 2025-10-15 08:50:00 정확히

**테스트:**

```typescript
// Integration Test
it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  // GIVEN: 08:49:59 (알림 1초 전)
  vi.setSystemTime(new Date('2025-10-15 08:49:59'));
  setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  // WHEN: 아직 시간 안 됨
  expect(screen.queryByText('10분 후 기존 회의 일정이 시작됩니다.')).not.toBeInTheDocument();

  // WHEN: 1초 진행 (08:50:00)
  act(() => {
    vi.advanceTimersByTime(1000);
  });

  // THEN: 알림 표시
  expect(screen.getByText('10분 후 기존 회의 일정이 시작됩니다.')).toBeInTheDocument();
});
```

---

### 🎯 예시 3: 반복 일정 단일 vs 전체 수정

**요구사항:**

- repeatId='series1' 일정 3개
- 단일 수정: id='1'만 변경
- 전체 수정: repeatId='series1' 모두 변경

**테스트:**

```typescript
// Hook Test
it('반복 일정 단일 수정 시 해당 일정만 업데이트된다', async () => {
  // GIVEN: repeatId='series1' 3개 일정
  setupMockHandlerUpdating([
    { id: '1', title: '회의', repeatId: 'series1' },
    { id: '2', title: '회의', repeatId: 'series1' },
    { id: '3', title: '회의', repeatId: 'series1' },
  ]);

  const { result } = renderHook(() => useEventOperations(true));
  await act(() => Promise.resolve(null));

  // WHEN: id='1' 단일 수정
  const updatedEvent = { ...result.current.events[0], title: '수정된 회의' };
  await act(async () => {
    await result.current.saveEvent(updatedEvent, 'single');
  });

  // THEN: id='1'만 수정, 나머지 유지
  expect(result.current.events[0].title).toBe('수정된 회의');
  expect(result.current.events[1].title).toBe('회의');
  expect(result.current.events[2].title).toBe('회의');
});
```

---

## 📌 핵심 요약

### 잘 작성된 테스트 체크리스트

- [ ] **신뢰성**: 같은 입력 → 같은 결과
- [ ] **가독성**: 테스트명만 읽어도 이해
- [ ] **유지보수성**: 내부 구현 변경 시에도 깨지지 않음
- [ ] **빠른 실행**: 외부 의존성 모킹
- [ ] **격리성**: 각 테스트 독립적

### 주의사항 Top 5

1. setupTests.ts 중복 설정 주의
2. expect.hasAssertions() 자동 적용 인지
3. MSW handlersUtils 재사용
4. Fake timers로 시간 진행 (실제 대기 금지)
5. 반복 일정 겹침 검증 최소화

### 계층별 책임

| 계층        | 대상         | Mock         | 예시                     |
| ----------- | ------------ | ------------ | ------------------------ |
| Unit        | 순수 함수    | 없음         | getDaysInMonth           |
| Hook        | Custom Hooks | MSW, vi.fn() | useEventOperations       |
| Integration | 사용자 흐름  | MSW만        | 일정 추가 폼 → 저장 → UI |

---

**Remember**: 테스트는 미래의 나와 팀을 위한 문서입니다. 명확하고 신뢰할 수 있는 테스트를 작성하세요! 🎯
