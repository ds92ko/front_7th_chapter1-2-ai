# 🧪 테스트 코드 (Test Code Document)

> 이 문서는 Poseidon 에이전트가 작성한 반복 일정 기능의 테스트 코드입니다.

---

## 1. 📋 테스트 코드 개요

- **테스트 프레임워크**: Vitest
- **React 테스트**: React Testing Library
- **테스트 파일 수**: 2개
  - `src/__tests__/unit/easy.recurringEvents.spec.ts`: 반복 일정 생성 유틸 함수 단위 테스트
  - `src/__tests__/hooks/medium.useEventOperations.spec.ts`: 반복 일정 저장 통합 테스트 (기존 파일에 추가)
- **스켈레톤 파일**: `src/utils/recurringEvents.ts`

---

## 2. 🎯 테스트 코드 상세

### 2.1 src/**tests**/unit/easy.recurringEvents.spec.ts

반복 일정 생성 로직을 테스트하는 단위 테스트입니다.

**테스트 범위:**

- `isLeapYear`: 윤년 판별 함수
- `getDaysInMonth`: 월별 일수 계산 함수
- `generateDailyEvents`: 매일 반복 일정 생성
- `generateWeeklyEvents`: 매주 반복 일정 생성
- `generateMonthlyEvents`: 매월 반복 일정 생성
- `generateYearlyEvents`: 매년 반복 일정 생성
- `generateRecurringEvents`: 메인 함수

**주요 테스트 케이스:**

1. 윤년 판별 (4/100/400 규칙)
2. 월별 일수 계산 (31일/30일/2월 28일/29일)
3. 매일 반복 (정상/간격 2일/종료일=시작일)
4. 매주 반복 (요일 유지/2주 간격/월 경계)
5. 매월 반복 (정상/31일 예외/30일 예외/2월 29일)
6. 매년 반복 (정상/2월 29일 윤년만/2년 간격)
7. 메인 함수 (각 타입별 호출/none/종료일 없음)

**엣지 케이스:**

- 31일 매월 반복 → 31일 없는 달 건너뜀
- 2월 29일 매년 반복 → 윤년에만 생성
- 2월 29일 매월 반복 → 2월만 생성

### 2.2 src/**tests**/hooks/medium.useEventOperations.spec.ts (추가)

`useEventOperations` 훅의 반복 일정 저장 기능을 테스트하는 통합 테스트입니다.

**테스트 범위:**

- 반복 일정 저장 시 `/api/events-list` 호출
- 반복 일정 저장 성공 시 이벤트 목록 갱신
- 반복 일정 저장 성공 시 성공 메시지 표시
- 단일 일정 저장 시 기존 API 호출 (기존 동작 유지)
- 반복 일정 저장 실패 시 에러 메시지 표시

---

## 3. 🛠️ 생성된 스켈레톤 파일

### 3.1 src/utils/recurringEvents.ts

반복 일정 생성 유틸 함수의 스켈레톤 파일입니다. 모든 함수가 빈 값을 반환하여 테스트가 실패하도록 구현되었습니다.

**포함된 함수:**

- `isLeapYear(year)`: `false` 반환
- `getDaysInMonth(year, month)`: `0` 반환
- `generateDailyEvents(...)`: `[]` 반환
- `generateWeeklyEvents(...)`: `[]` 반환
- `generateMonthlyEvents(...)`: `[]` 반환
- `generateYearlyEvents(...)`: `[]` 반환
- `generateRecurringEvents(eventData)`: `[]` 반환

### 3.2 src/types.ts (수정)

`RepeatInfo` 인터페이스에 `id?: string` 필드를 추가하여 반복 시리즈를 식별할 수 있도록 했습니다.

---

## 4. ✅ 테스트 실행 결과 (예상)

**예상 결과**: **실패 (Red 단계)**

모든 테스트가 실패해야 합니다. 스켈레톤 함수들이 빈 값만 반환하므로:

- `isLeapYear`는 항상 `false` 반환 → 윤년 테스트 실패
- `getDaysInMonth`는 항상 `0` 반환 → 일수 계산 테스트 실패
- 모든 `generate*Events` 함수는 빈 배열 반환 → 일정 생성 테스트 실패
- `useEventOperations`의 반복 일정 저장 테스트 실패

---

## 5. 📚 관련 파일

- **테스트 파일**:
  - `src/__tests__/unit/easy.recurringEvents.spec.ts`
  - `src/__tests__/hooks/medium.useEventOperations.spec.ts`
- **스켈레톤 파일**:
  - `src/utils/recurringEvents.ts`
- **타입 파일**:
  - `src/types.ts` (RepeatInfo에 id 필드 추가)
- **명세 문서**:
  - `feature_spec.md`
  - `test_spec.md`

---

## 📝 변경 이력

| 버전 | 날짜       | 변경 내용                         | 작성자   |
| :--- | :--------- | :-------------------------------- | :------- |
| 1.0  | 2025-10-31 | 테스트 코드 및 스켈레톤 파일 작성 | Poseidon |
