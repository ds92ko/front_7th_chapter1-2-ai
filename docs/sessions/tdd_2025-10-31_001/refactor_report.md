# 📝 리팩토링 보고서 (refactor_report.md)

> 이 문서는 Apollo 에이전트가 Hermes 에이전트의 구현 코드를 리팩토링한 후 생성하는 보고서입니다. 리팩토링의 목적, 변경 내용, 개선 효과 및 관련 테스트 결과 등을 상세히 기록하여 코드 품질 개선 과정을 투명하게 공유합니다.

---

## 1. 🎯 리팩토링 개요

- **리팩토링 대상**: `src/utils/recurringEvents.ts` - 반복 일정 생성 유틸리티 함수
- **리팩토링 목적**: 
  - 코드 가독성 향상 (매직 넘버 제거)
  - 재사용성 증대 (공통 로직 추출)
  - 유지보수성 개선 (중복 코드 제거)
- **리팩토링 범위**: Hermes가 새로 추가한 `recurringEvents.ts` 파일에 한정하여 리팩토링 진행

---

## 2. 🚀 리팩토링 전 코드 상태

### 문제점 분석

1. **매직 넘버 남용**: `2`, `7`, `12`, `29`, `28`, `30`, `31` 등의 숫자가 코드에 직접 사용됨
2. **중복 코드**: 날짜 문자열 변환 로직 (`toISOString().split('T')[0]`)이 여러 곳에 반복
3. **이벤트 생성 로직 중복**: `events.push({ ...eventData, date: dateStr })` 패턴이 모든 함수에 반복

### 리팩토링 전 주요 코드

```typescript
export const getDaysInMonth = (year: number, month: number): number => {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
};

export const generateDailyEvents = (
  startDate: string,
  endDate: string,
  interval: number,
  eventData: EventForm
): EventForm[] => {
  // ...
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    events.push({
      ...eventData,
      date: dateStr,
    });
    currentDate.setDate(currentDate.getDate() + interval);
  }
  // ...
};

export const generateWeeklyEvents = (/* ... */) => {
  // ...
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];
    events.push({
      ...eventData,
      date: dateStr,
    });
    currentDate.setDate(currentDate.getDate() + 7 * interval);
  }
  // ...
};
```

---

## 3. ✨ 리팩토링 내용 및 개선 효과

### 3.1. 주요 변경 사항 요약

- **변경 1**: 매직 넘버를 명확한 의미를 가진 상수로 추출
- **변경 2**: 날짜 문자열 변환 로직을 `formatDateString` 함수로 추출
- **변경 3**: 이벤트 생성 로직을 `createEventForDate` 함수로 추출

### 3.2. 상세 변경 내용 및 이유

#### 변경 1: 매직 넘버를 상수로 추출

**변경 전:**
```typescript
if (month === 2) {
  return isLeapYear(year) ? 29 : 28;
}
if ([4, 6, 9, 11].includes(month)) {
  return 30;
}
return 31;
```

**변경 후:**
```typescript
// 파일 상단에 상수 정의
const MONTHS_IN_YEAR = 12;
const DAYS_IN_WEEK = 7;
const FEBRUARY = 2;
const FEBRUARY_LEAP_DAYS = 29;
const FEBRUARY_NORMAL_DAYS = 28;
const MONTHS_WITH_30_DAYS = [4, 6, 9, 11];
const DAYS_IN_LONG_MONTH = 31;
const DAYS_IN_SHORT_MONTH = 30;

// 함수 내부
if (month === FEBRUARY) {
  return isLeapYear(year) ? FEBRUARY_LEAP_DAYS : FEBRUARY_NORMAL_DAYS;
}
if (MONTHS_WITH_30_DAYS.includes(month)) {
  return DAYS_IN_SHORT_MONTH;
}
return DAYS_IN_LONG_MONTH;
```

**변경 이유:**
- 코드의 의도를 명확히 표현 (`2` → `FEBRUARY`)
- 값의 의미를 즉시 파악 가능 (`7` → `DAYS_IN_WEEK`)
- 수정 시 변경 포인트 단일화 (상수만 수정하면 됨)

**개선 효과:**
- **가독성 향상**: 숫자 대신 명확한 의미를 가진 이름 사용
- **유지보수성 향상**: 상수 변경 시 한 곳만 수정하면 됨
- **의도 명확화**: 코드 리뷰 시 의도를 쉽게 파악 가능

---

#### 변경 2: 날짜 문자열 변환 함수 추출

**변경 전:**
```typescript
const dateStr = currentDate.toISOString().split('T')[0];
events.push({
  ...eventData,
  date: dateStr,
});
// 이 패턴이 4개 함수에 반복됨
```

**변경 후:**
```typescript
/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 */
const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 사용
events.push(createEventForDate(eventData, currentDate));
```

**변경 이유:**
- DRY(Don't Repeat Yourself) 원칙 준수
- 날짜 포맷 변경 시 한 곳만 수정하면 됨
- 함수명으로 의도를 명확히 표현

**개선 효과:**
- **중복 제거**: 4개 함수에서 반복된 로직을 1개 함수로 통합
- **유지보수성**: 날짜 포맷 변경 시 한 곳만 수정
- **테스트 용이성**: 날짜 포맷 로직을 독립적으로 테스트 가능

---

#### 변경 3: 이벤트 생성 로직 함수 추출

**변경 전:**
```typescript
const dateStr = currentDate.toISOString().split('T')[0];
events.push({
  ...eventData,
  date: dateStr,
});
```

**변경 후:**
```typescript
/**
 * 이벤트 데이터를 특정 날짜로 복사
 */
const createEventForDate = (eventData: EventForm, date: Date): EventForm => {
  return {
    ...eventData,
    date: formatDateString(date),
  };
};

// 사용
events.push(createEventForDate(eventData, currentDate));
```

**변경 이유:**
- 이벤트 생성 로직을 한 곳에 집중
- 날짜 포맷 변환 로직과 이벤트 객체 생성 로직을 함께 캡슐화
- 함수 이름으로 "특정 날짜의 이벤트 생성"이라는 의도를 명확히 표현

**개선 효과:**
- **응집도 향상**: 관련 있는 로직을 한 곳에 모음
- **가독성 향상**: `createEventForDate`라는 명확한 이름으로 의도 표현
- **확장성**: 향후 이벤트 생성 로직 변경 시 한 곳만 수정

---

#### 변경 4: 상수 활용으로 로직 개선

**변경 전:**
```typescript
currentDate.setDate(currentDate.getDate() + 7 * interval);
```

**변경 후:**
```typescript
currentDate.setDate(currentDate.getDate() + DAYS_IN_WEEK * interval);
```

**변경 이유:**
- `7`이 "한 주의 일 수"를 의미함을 명확히 표현

**개선 효과:**
- **의도 명확화**: 숫자 `7`이 "주간 반복"을 의미함을 즉시 파악 가능

---

## 4. 🧪 테스트 결과

### 단위 테스트
```bash
✓ src/__tests__/unit/easy.recurringEvents.spec.ts (27 tests) 8ms
```

### 전체 테스트
```bash
Test Files  12 passed (12)
     Tests  147 passed (147)
  Duration  14.92s
```

- **테스트 실행 결과**: 리팩토링 후 `pnpm run test` 명령을 실행했을 때 **모든 테스트(147개)가 성공적으로 통과**했습니다.
- **관련 테스트 파일**: 
  - `src/__tests__/unit/easy.recurringEvents.spec.ts` (27 tests)
  - `src/__tests__/hooks/medium.useEventOperations.spec.ts` (12 tests)
  - `src/__tests__/medium.integration.spec.tsx` (14 tests)
- **테스트 커버리지**: 리팩토링은 기능 변경 없이 내부 구조만 개선했으므로 모든 테스트가 그대로 통과함

---

## 5. 🚀 리팩토링 후 코드 상태

### 개선된 최종 코드

```typescript
import { EventForm } from '../types';

// 상수 정의
const MONTHS_IN_YEAR = 12;
const DAYS_IN_WEEK = 7;
const FEBRUARY = 2;
const FEBRUARY_LEAP_DAYS = 29;
const FEBRUARY_NORMAL_DAYS = 28;
const MONTHS_WITH_30_DAYS = [4, 6, 9, 11];
const DAYS_IN_LONG_MONTH = 31;
const DAYS_IN_SHORT_MONTH = 30;

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 */
const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * 이벤트 데이터를 특정 날짜로 복사
 */
const createEventForDate = (eventData: EventForm, date: Date): EventForm => {
  return {
    ...eventData,
    date: formatDateString(date),
  };
};

/**
 * 특정 연도와 월의 일수를 반환하는 함수
 */
export const getDaysInMonth = (year: number, month: number): number => {
  if (month === FEBRUARY) {
    return isLeapYear(year) ? FEBRUARY_LEAP_DAYS : FEBRUARY_NORMAL_DAYS;
  }
  if (MONTHS_WITH_30_DAYS.includes(month)) {
    return DAYS_IN_SHORT_MONTH;
  }
  return DAYS_IN_LONG_MONTH;
};

/**
 * 매일 반복 일정 생성
 */
export const generateDailyEvents = (
  startDate: string,
  endDate: string,
  interval: number,
  eventData: EventForm
): EventForm[] => {
  const events: EventForm[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let currentDate = new Date(start);

  while (currentDate <= end) {
    events.push(createEventForDate(eventData, currentDate));
    currentDate.setDate(currentDate.getDate() + interval);
  }

  return events;
};

/**
 * 매주 반복 일정 생성
 */
export const generateWeeklyEvents = (
  startDate: string,
  endDate: string,
  interval: number,
  eventData: EventForm
): EventForm[] => {
  const events: EventForm[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let currentDate = new Date(start);

  while (currentDate <= end) {
    events.push(createEventForDate(eventData, currentDate));
    currentDate.setDate(currentDate.getDate() + DAYS_IN_WEEK * interval);
  }

  return events;
};
```

---

## 6. 📊 리팩토링 성과 요약

| 항목 | 개선 전 | 개선 후 | 효과 |
|------|---------|---------|------|
| 매직 넘버 | 7개 위치에 사용 | 상수로 통합 | 가독성 향상 |
| 중복 코드 | 날짜 변환 4회 반복 | 1개 함수로 통합 | 유지보수성 향상 |
| 이벤트 생성 | 4회 반복 패턴 | 1개 함수로 통합 | 재사용성 향상 |
| 테스트 통과율 | 100% | 100% | 기능 무변경 확인 |

---

## 7. 📚 관련 문서 및 참조

- **`agents_spec.md`**: 시스템 전체 명세
- **`apollo_guide.md`**: Apollo 에이전트 작업 가이드라인
- **`impl_code.md`**: Hermes가 작성한 구현 코드 (업데이트됨)
- **`test_code.md`**: Poseidon이 작성한 테스트 코드

---

## 8. 💡 향후 개선 제안

리팩토링은 완료되었으나, 향후 고려할 수 있는 추가 개선 사항:

1. **타입 안전성 강화**: `Date` 객체 대신 타입 안전한 날짜 라이브러리 사용 고려 (프로젝트 정책에 따라)
2. **성능 최적화**: 대량의 반복 일정 생성 시 성능 측정 및 최적화 고려
3. **에러 처리**: 잘못된 날짜 입력에 대한 명시적 에러 처리 추가

---

## 9. 📝 변경 이력

| 버전 | 날짜       | 변경 내용                | 작성자 |
| :--- | :--------- | :----------------------- | :----- |
| 1.0  | 2025-10-31 | 최초 작성 (리팩토링 완료) | Apollo |

