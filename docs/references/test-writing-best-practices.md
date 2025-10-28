# 테스트 작성 베스트 프랙티스

> **출처**: Kent Beck의 TDD, Martin Fowler, Uncle Bob (Robert C. Martin), 그리고 유명 엔지니어들의 테스트 작성 원칙을 정리한 문서입니다.

**Version:** 1.0.0  
**Last Updated:** 2025-10-28  
**Purpose:** 아르테미스 에이전트가 참고하는 테스트 작성 가이드라인

---

## 📋 목차

1. [Kent Beck의 TDD 원칙](#1-kent-beck의-tdd-원칙)
2. [FIRST 원칙 (Robert C. Martin)](#2-first-원칙-robert-c-martin)
3. [AAA 패턴 (Arrange-Act-Assert)](#3-aaa-패턴-arrange-act-assert)
4. [테스트 네이밍 베스트 프랙티스](#4-테스트-네이밍-베스트-프랙티스)
5. [Mock/Stub 전략](#5-mockstub-전략)
6. [테스트 코드 품질 원칙](#6-테스트-코드-품질-원칙)
7. [안티패턴 (피해야 할 것들)](#7-안티패턴-피해야-할-것들)
8. [커버리지 전략](#8-커버리지-전략)

---

## 1. Kent Beck의 TDD 원칙

### 🔴 Red-Green-Refactor Cycle

> **"Test-Driven Development is not about testing. It's about design."** - Kent Beck

```
RED (실패하는 테스트 작성)
  ↓
GREEN (최소한의 코드로 통과)
  ↓
REFACTOR (중복 제거, 구조 개선)
  ↓
(반복)
```

#### RED 단계

- **실패하는 테스트**를 먼저 작성
- 컴파일 에러도 "실패"로 간주
- 한 번에 하나의 테스트만 작성

```typescript
// ❌ BAD: 구현 먼저
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

// ✅ GOOD: 테스트 먼저
it('윤년의 2월에 대해 29일을 반환한다', () => {
  expect(getDaysInMonth(2024, 2)).toBe(29); // 이 시점에 함수 없음 (RED)
});
```

#### GREEN 단계

- 테스트를 **통과시키는 최소한의 코드**만 작성
- 완벽한 구조보다 **빠른 피드백** 우선
- 하드코딩도 괜찮음 (리팩토링 단계에서 개선)

```typescript
// ✅ GOOD: 최소 구현 (하드코딩도 OK)
function getDaysInMonth(year: number, month: number) {
  if (year === 2024 && month === 2) return 29; // GREEN 먼저
  return 30; // 일단 통과
}
```

#### REFACTOR 단계

- **중복 제거**
- 의미 있는 이름으로 변경
- 함수 추출, 상수 분리
- 테스트는 **여전히 GREEN 유지**

```typescript
// ✅ GOOD: 리팩토링 (테스트는 그대로)
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate(); // 일반화
}
```

---

### ⚡ Kent Beck's Three Rules of TDD

1. **Write no production code except to pass a failing test**

   - 실패하는 테스트 없이 프로덕션 코드 작성 금지

2. **Write only enough of a test to demonstrate a failure**

   - 실패를 보여줄 만큼만 테스트 작성 (하나씩)

3. **Write only enough production code to pass the test**
   - 테스트를 통과할 만큼만 코드 작성

---

## 2. FIRST 원칙 (Robert C. Martin)

> **"Clean Code that Works"** - Ron Jeffries

### F - Fast (빠르게)

- 테스트는 **빠르게 실행**되어야 함
- 느린 테스트는 자주 실행하지 않게 됨
- 외부 의존성은 Mock으로 대체

```typescript
// ❌ BAD: 실제 API 호출 (느림)
it('이벤트를 가져온다', async () => {
  const response = await fetch('https://api.example.com/events');
  // ...
});

// ✅ GOOD: MSW로 모킹 (빠름)
it('이벤트를 가져온다', async () => {
  server.use(http.get('/api/events', () => HttpResponse.json({ events: [] })));
  // ...
});
```

---

### I - Independent/Isolated (독립적)

- 각 테스트는 **다른 테스트에 의존하지 않음**
- 실행 순서에 무관하게 통과
- 공유 상태 사용 금지

```typescript
// ❌ BAD: 테스트 간 의존성
let sharedEvents: Event[] = [];

it('이벤트를 추가한다', () => {
  sharedEvents.push(newEvent); // 다음 테스트에 영향
  expect(sharedEvents).toHaveLength(1);
});

it('이벤트 개수를 확인한다', () => {
  expect(sharedEvents).toHaveLength(1); // 이전 테스트에 의존
});

// ✅ GOOD: 각 테스트 독립적
it('이벤트를 추가한다', () => {
  const events: Event[] = [];
  events.push(newEvent);
  expect(events).toHaveLength(1);
});

it('빈 배열의 길이는 0이다', () => {
  const events: Event[] = [];
  expect(events).toHaveLength(0);
});
```

---

### R - Repeatable (반복 가능)

- **어떤 환경**에서든 동일한 결과
- 시간, 네트워크, 파일 시스템에 독립적
- Fake timers, MSW 활용

```typescript
// ❌ BAD: 시스템 시간 의존
it('알림을 10분 전에 표시한다', () => {
  const now = new Date(); // 실행 시점마다 다름
  // ...
});

// ✅ GOOD: 고정 시간
it('알림을 10분 전에 표시한다', () => {
  vi.setSystemTime(new Date('2025-10-15 08:50:00'));
  // ...
});
```

---

### S - Self-Validating (자가 검증)

- 테스트는 **Boolean 결과** (성공/실패)
- 수동 검증 불필요
- 명확한 `expect` 사용

```typescript
// ❌ BAD: 수동 검증 필요
it('이벤트를 저장한다', async () => {
  await saveEvent(newEvent);
  console.log('수동으로 확인하세요'); // 자동 검증 아님
});

// ✅ GOOD: 자동 검증
it('이벤트를 저장한다', async () => {
  await saveEvent(newEvent);
  expect(result.current.events).toContainEqual(newEvent);
});
```

---

### T - Timely (적시에)

- 프로덕션 코드 **직전**에 작성
- 너무 늦으면 테스트하기 어려운 구조 발생
- TDD 사이클 준수

```typescript
// ✅ GOOD: 테스트 먼저 (RED)
it('윤년을 정확히 판단한다', () => {
  expect(isLeapYear(2024)).toBe(true);
  expect(isLeapYear(2023)).toBe(false);
});

// 그 다음 구현 (GREEN)
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
```

---

## 3. AAA 패턴 (Arrange-Act-Assert)

> **또는 GIVEN-WHEN-THEN 패턴** (BDD 스타일)

### 구조

```typescript
it('테스트 케이스명', () => {
  // ARRANGE (준비): 초기 상태 설정
  const input = { ... };
  const expected = { ... };

  // ACT (실행): 테스트 대상 함수 호출
  const result = functionUnderTest(input);

  // ASSERT (검증): 결과 확인
  expect(result).toEqual(expected);
});
```

### 예시

```typescript
it('두 날짜 범위가 겹치는지 확인한다', () => {
  // GIVEN: 겹치는 두 일정
  const event1 = { startTime: '09:00', endTime: '10:00' };
  const event2 = { startTime: '09:30', endTime: '10:30' };

  // WHEN: 겹침 검사
  const result = isOverlapping(event1, event2);

  // THEN: true 반환
  expect(result).toBe(true);
});
```

### 주석 사용 (명확성)

```typescript
// ✅ GOOD: GIVEN-WHEN-THEN 주석으로 구조 명확화
it('네트워크 오류 시 에러 토스트가 표시된다', async () => {
  // GIVEN: MSW 500 응답 설정
  server.use(http.get('/api/events', () => new HttpResponse(null, { status: 500 })));

  // WHEN: Hook 호출
  const { result } = renderHook(() => useEventOperations(true));
  await act(() => Promise.resolve(null));

  // THEN: 에러 토스트 호출 확인
  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
});
```

---

## 4. 테스트 네이밍 베스트 프랙티스

### 📝 좋은 테스트명의 조건

1. **무엇을 테스트하는지 명확**
2. **어떤 조건에서** (Given)
3. **어떤 결과가 나오는지** (Then)
4. **한글 서술형** (프로젝트 규칙)

### 네이밍 패턴

#### Pattern 1: `[무엇을] [조건에서] [결과]`

```typescript
// ✅ GOOD
it('윤년의 2월에 대해 29일을 반환한다', () => { ... });
it('네트워크 오류 시 에러 토스트가 표시된다', () => { ... });
it('빈 검색어 입력 시 모든 일정이 표시된다', () => { ... });
```

#### Pattern 2: BDD 스타일

```typescript
describe('반복 일정 생성', () => {
  describe('윤년 2월 29일 케이스', () => {
    it('다음 윤년까지 건너뛴다', () => { ... });
  });

  describe('31일 케이스', () => {
    it('30일 달에서는 생성되지 않는다', () => { ... });
  });
});
```

### ❌ 피해야 할 네이밍

```typescript
// ❌ BAD: 모호함
it('테스트1', () => { ... });
it('동작 확인', () => { ... });
it('should work', () => { ... });

// ❌ BAD: 구현 세부사항
it('getDaysInMonth를 호출한다', () => { ... }); // 무엇을 검증?
it('state를 업데이트한다', () => { ... }); // 어떻게?

// ✅ GOOD: 명확한 의도
it('getDaysInMonth는 윤년 2월에 29일을 반환한다', () => { ... });
it('saveEvent 호출 후 events 배열에 새 일정이 추가된다', () => { ... });
```

---

## 5. Mock/Stub 전략

### 🎭 Mock vs Stub vs Spy

#### Mock

- **행동 검증** (함수가 호출되었는지)
- 예: `expect(fn).toHaveBeenCalled()`

```typescript
const enqueueSnackbarFn = vi.fn();
vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: enqueueSnackbarFn }),
}));

// 검증
expect(enqueueSnackbarFn).toHaveBeenCalledWith('에러 메시지', { variant: 'error' });
```

#### Stub

- **상태 검증** (반환값 제공)
- 예: MSW로 API 응답 모킹

```typescript
server.use(
  http.get('/api/events', () => {
    return HttpResponse.json({ events: [mockEvent] }); // 고정 응답
  })
);
```

#### Spy

- **실제 구현 유지** + 호출 감시
- 예: `vi.spyOn()`

```typescript
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
// ...
expect(consoleSpy).toHaveBeenCalled();
consoleSpy.mockRestore();
```

---

### 🎯 Mock 사용 원칙

1. **외부 의존성만 모킹** (느린 것, 불안정한 것)

   - API 호출 (MSW)
   - 시간 (Fake timers)
   - 파일 시스템 (필요 시)

2. **순수 함수는 모킹하지 않음**

   ```typescript
   // ❌ BAD
   vi.mock('./dateUtils', () => ({ getDaysInMonth: vi.fn() }));

   // ✅ GOOD: 실제 함수 호출
   import { getDaysInMonth } from './dateUtils';
   expect(getDaysInMonth(2024, 2)).toBe(29);
   ```

3. **과도한 모킹 경계**
   - 모든 것을 모킹하면 통합 버그 발견 못 함
   - Unit/Hook/Integration 계층 분리로 해결

---

## 6. 테스트 코드 품질 원칙

### 📐 DRY vs DAMP

#### DRY (Don't Repeat Yourself)

- **프로덕션 코드** 원칙
- 중복 제거, 재사용

#### DAMP (Descriptive And Meaningful Phrases)

- **테스트 코드** 원칙
- **명확성** > 중복 제거
- 각 테스트는 독립적으로 읽혀야 함

```typescript
// ❌ BAD: 과도한 DRY (테스트 이해 어려움)
const setup = () => {
  /* 복잡한 설정 */
};
it('테스트1', () => {
  const result = setup(); /* 무슨 상태인지 모름 */
});

// ✅ GOOD: DAMP (약간의 중복 허용)
it('윤년 2월 29일 케이스', () => {
  const event = { date: '2024-02-29', repeat: { type: 'yearly' } }; // 명확
  const result = generateRepeatEvents(event, 2);
  expect(result).toHaveLength(2);
});

it('평년 2월 28일 케이스', () => {
  const event = { date: '2023-02-28', repeat: { type: 'yearly' } }; // 중복이지만 명확
  const result = generateRepeatEvents(event, 2);
  expect(result).toHaveLength(2);
});
```

---

### 🧩 헬퍼 함수 사용 시기

- **반복되는 복잡한 설정**: 헬퍼 OK
- **간단한 데이터 생성**: 테스트 내부 유지

```typescript
// ✅ GOOD: 복잡한 설정은 헬퍼
const saveSchedule = async (user: UserEvent, form: Omit<Event, 'id'>) => {
  await user.click(screen.getAllByText('일정 추가')[0]);
  await user.type(screen.getByLabelText('제목'), form.title);
  // ... 10줄 이상
};

// ✅ GOOD: 간단한 데이터는 인라인
it('윤년을 판단한다', () => {
  expect(isLeapYear(2024)).toBe(true); // 헬퍼 불필요
});
```

---

## 7. 안티패턴 (피해야 할 것들)

### ❌ 1. 내부 구현 세부사항 테스트

```typescript
// ❌ BAD: private state 직접 접근
it('내부 state가 업데이트된다', () => {
  const { result } = renderHook(() => useEventOperations());
  expect(result.current._internalState).toBe('loading'); // 내부 구현
});

// ✅ GOOD: public API만 테스트
it('로딩 중일 때 스피너가 표시된다', () => {
  render(<EventList />);
  expect(screen.getByRole('progressbar')).toBeInTheDocument(); // 사용자 관점
});
```

---

### ❌ 2. 거대한 스냅샷 테스트

```typescript
// ❌ BAD: 의미 없는 스냅샷
it('컴포넌트를 렌더링한다', () => {
  const { container } = render(<App />);
  expect(container).toMatchSnapshot(); // 1000줄 HTML
});

// ✅ GOOD: 특정 값 검증
it('이벤트 제목이 표시된다', () => {
  render(<EventItem event={mockEvent} />);
  expect(screen.getByText('팀 회의')).toBeInTheDocument();
});
```

---

### ❌ 3. 테스트 간 의존성

```typescript
// ❌ BAD
let globalEvents: Event[] = [];

it('이벤트를 추가한다', () => {
  globalEvents.push(newEvent); // 다음 테스트에 영향
});

it('이벤트 개수를 확인한다', () => {
  expect(globalEvents).toHaveLength(1); // 이전 테스트 의존
});

// ✅ GOOD: beforeEach로 초기화
describe('이벤트 관리', () => {
  let events: Event[];

  beforeEach(() => {
    events = []; // 각 테스트마다 초기화
  });

  it('이벤트를 추가한다', () => {
    events.push(newEvent);
    expect(events).toHaveLength(1);
  });
});
```

---

### ❌ 4. 과도한 expect (하나의 테스트, 하나의 개념)

```typescript
// ❌ BAD: 여러 개념 섞임
it('이벤트 CRUD', () => {
  saveEvent(newEvent);
  expect(events).toHaveLength(1);
  updateEvent(newEvent);
  expect(events[0].title).toBe('수정됨');
  deleteEvent(newEvent.id);
  expect(events).toHaveLength(0);
});

// ✅ GOOD: 분리
it('이벤트를 추가한다', () => {
  saveEvent(newEvent);
  expect(events).toHaveLength(1);
});

it('이벤트를 수정한다', () => {
  updateEvent(newEvent);
  expect(events[0].title).toBe('수정됨');
});

it('이벤트를 삭제한다', () => {
  deleteEvent(newEvent.id);
  expect(events).toHaveLength(0);
});
```

---

### ❌ 5. 불필요한 100% 커버리지 추구

```typescript
// ❌ BAD: 의미 없는 테스트
it('타입 정의가 존재한다', () => {
  const event: Event = { ... };
  expect(event).toBeDefined(); // 커버리지만 올림
});

// ✅ GOOD: 의미 있는 테스트만
it('잘못된 날짜 형식 입력 시 에러를 던진다', () => {
  expect(() => parseDate('2025/10/01')).toThrow('Invalid format');
});
```

---

## 8. 커버리지 전략

### 🎯 목표 설정

- **Lines ≥85%**: 핵심 로직 대부분 커버
- **Branches ≥75%**: 조건문, 예외 처리 포함
- **100% 불필요**: 비용 대비 효과 낮음

---

### 📊 우선순위

1. **High**: 핵심 비즈니스 로직

   - 반복 일정 생성/수정/삭제
   - 겹침 검증
   - 알림 트리거

2. **Medium**: 에러 처리

   - 네트워크 오류
   - 잘못된 입력

3. **Low**: 단순 유틸
   - Getter/Setter
   - 타입 변환

---

### 🚫 커버리지 제외 대상

```typescript
// .c8rc.json 또는 vitest.config.ts
{
  "exclude": [
    "**/*.d.ts",          // 타입 정의
    "**/__mocks__/**",    // Mock 파일
    "**/setupTests.ts",   // 테스트 설정
    "**/vite-env.d.ts"    // Vite 타입
  ]
}
```

---

## 📚 추가 참고 자료

### 책

- **"Test Driven Development: By Example"** - Kent Beck
- **"Clean Code"** - Robert C. Martin
- **"Refactoring"** - Martin Fowler
- **"Growing Object-Oriented Software, Guided by Tests"** - Steve Freeman, Nat Pryce

### 아티클

- Martin Fowler: "Test Pyramid"
- Kent Beck: "Programmer Test Principles"
- Uncle Bob: "The Three Rules of TDD"

### 도구별 가이드

- **Vitest**: https://vitest.dev/guide/
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro/
- **MSW**: https://mswjs.io/docs/

---

## 🎯 핵심 요약

1. **TDD 사이클**: RED → GREEN → REFACTOR
2. **FIRST**: Fast, Independent, Repeatable, Self-validating, Timely
3. **AAA**: Arrange-Act-Assert (GIVEN-WHEN-THEN)
4. **명확한 네이밍**: 무엇을, 어떤 조건에서, 어떤 결과
5. **최소 모킹**: 외부 의존성만, 순수 함수는 실제 호출
6. **DAMP over DRY**: 테스트는 명확성 우선
7. **의미 있는 커버리지**: 85% 목표, 100% 불필요
8. **사용자 관점**: 내부 구현이 아닌 Public API 검증

---

**Remember**: 테스트는 문서입니다. 6개월 후 다른 개발자가 읽었을 때 이해 가능해야 합니다. 🎯
