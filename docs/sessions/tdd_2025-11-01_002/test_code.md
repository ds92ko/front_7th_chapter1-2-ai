# 테스트 코드: 반복 종료일 입력 제한

**작성자**: Poseidon (테스트 코드 작성자)  
**작성일**: 2025-10-31  
**Session ID**: tdd_2025-11-01_002  
**참조 문서**: `test_spec.md`

---

## 1. 테스트 코드 개요

### 1.1 테스트 파일 정보

- **파일 경로**: `src/__tests__/unit/easy.repeatEndDateLimit.spec.ts`
- **테스트 대상**: 반복 종료일 입력 필드의 `max` 속성
- **테스트 프레임워크**: Vitest + React Testing Library

### 1.2 구현 범위

- TC-001: 반복 종료일 필드의 `max` 속성 검증
- TC-002: 모든 반복 유형에서 `max` 속성 동일 적용 검증
- TC-003: 2025-12-31을 종료일로 하는 반복 일정 생성 검증

---

## 2. 테스트 코드

### 2.1 전체 코드

```typescript
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../../App';
import { server } from '../../__mocks__/server';
import { http, HttpResponse } from 'msw';

describe('반복 종료일 입력 제한', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-01'));
  });

  describe('TC-001: max 속성 검증', () => {
    it('반복 종료일 필드에 max 속성이 2025-12-31로 설정되어 있어야 한다', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 일정 추가 버튼 클릭
      const addButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(addButton);

      // 반복 유형 선택
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      const weeklyOption = await screen.findByRole('option', { name: '매주' });
      await user.click(weeklyOption);

      // 반복 종료일 입력 필드 찾기
      const repeatEndDateInput = screen.getByLabelText('반복 종료일') as HTMLInputElement;

      // max 속성 검증
      expect(repeatEndDateInput).toHaveAttribute('max', '2025-12-31');
    });
  });

  describe('TC-002: 반복 유형별 max 속성 검증', () => {
    it.each([
      { type: 'daily', label: '매일' },
      { type: 'weekly', label: '매주' },
      { type: 'monthly', label: '매월' },
      { type: 'yearly', label: '매년' },
    ])(
      '$type 반복 유형에서도 max 속성이 2025-12-31이어야 한다',
      async ({ type, label }) => {
        const user = userEvent.setup();
        render(<App />);

        // 일정 추가 버튼 클릭
        const addButton = screen.getByRole('button', { name: /일정 추가/i });
        await user.click(addButton);

        // 반복 유형 선택
        const repeatTypeSelect = screen.getByLabelText('반복 유형');
        await user.click(repeatTypeSelect);
        const option = await screen.findByRole('option', { name: label });
        await user.click(option);

        // 반복 종료일 입력 필드 찾기
        const repeatEndDateInput = screen.getByLabelText('반복 종료일') as HTMLInputElement;

        // max 속성 검증
        expect(repeatEndDateInput).toHaveAttribute('max', '2025-12-31');
      }
    );
  });

  describe('TC-003: 반복 일정 생성 기능 검증', () => {
    it('2025-12-31을 반복 종료일로 설정하여 일정을 생성할 수 있어야 한다', async () => {
      const user = userEvent.setup();

      // Mock API 설정
      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json([], { status: 200 });
        }),
        http.post('/api/events-list', async ({ request }) => {
          const events = await request.json();
          return HttpResponse.json(events, { status: 201 });
        })
      );

      render(<App />);
      await screen.findByText('일정 로딩 완료!');

      // 일정 추가 버튼 클릭
      const addButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(addButton);

      // 일정 정보 입력
      const titleInput = screen.getByLabelText('제목');
      await user.type(titleInput, '주간 회의');

      const dateInput = screen.getByLabelText('날짜');
      await user.clear(dateInput);
      await user.type(dateInput, '2025-11-01');

      const startTimeInput = screen.getByLabelText('시작 시간');
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '10:00');

      const endTimeInput = screen.getByLabelText('종료 시간');
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '11:00');

      // 반복 유형 선택
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      const weeklyOption = await screen.findByRole('option', { name: '매주' });
      await user.click(weeklyOption);

      // 반복 종료일 입력
      const repeatEndDateInput = screen.getByLabelText('반복 종료일');
      await user.clear(repeatEndDateInput);
      await user.type(repeatEndDateInput, '2025-12-31');

      // 일정 저장
      const submitButton = screen.getByRole('button', { name: /일정 (추가|저장)/i });
      await user.click(submitButton);

      // 저장 성공 확인
      await waitFor(() => {
        expect(screen.getByText('일정 로딩 완료!')).toBeInTheDocument();
      });

      // 생성된 반복 일정 확인 (최소 1개 이상 생성되어야 함)
      await waitFor(() => {
        expect(screen.queryByText('주간 회의')).toBeInTheDocument();
      });
    });
  });
});
```

---

## 3. 테스트 코드 설명

### 3.1 TC-001: max 속성 검증

**핵심 로직**:

```typescript
const repeatEndDateInput = screen.getByLabelText('반복 종료일') as HTMLInputElement;
expect(repeatEndDateInput).toHaveAttribute('max', '2025-12-31');
```

**설명**:

1. 일정 추가 폼을 열고 반복 유형을 선택한다.
2. "반복 종료일" 레이블을 가진 입력 필드를 찾는다.
3. `max` 속성이 `'2025-12-31'`인지 검증한다.

**예상 결과 (Red Phase)**:

- ❌ FAIL: `max` 속성이 존재하지 않거나 값이 다름

---

### 3.2 TC-002: 반복 유형별 max 속성 검증

**핵심 로직**:

```typescript
it.each([
  { type: 'daily', label: '매일' },
  { type: 'weekly', label: '매주' },
  { type: 'monthly', label: '매월' },
  { type: 'yearly', label: '매년' },
]);
```

**설명**:

1. Vitest의 `it.each`를 사용하여 4개의 반복 유형을 테스트한다.
2. 각 반복 유형에 대해 동일하게 `max` 속성을 검증한다.
3. 코드 중복을 줄이고 가독성을 높인다.

**예상 결과 (Red Phase)**:

- ❌ FAIL: 모든 반복 유형에서 `max` 속성이 없음

---

### 3.3 TC-003: 반복 일정 생성 기능 검증

**핵심 로직**:

```typescript
// 반복 종료일 입력
const repeatEndDateInput = screen.getByLabelText('반복 종료일');
await user.clear(repeatEndDateInput);
await user.type(repeatEndDateInput, '2025-12-31');

// 일정 저장 후 확인
await waitFor(() => {
  expect(screen.queryByText('주간 회의')).toBeInTheDocument();
});
```

**설명**:

1. 반복 일정을 생성하는 전체 플로우를 테스트한다.
2. 반복 종료일을 `2025-12-31`로 설정한다.
3. 일정이 성공적으로 생성되고 화면에 표시되는지 확인한다.

**예상 결과 (Red Phase 또는 Green Phase)**:

- ✅ PASS: 기존 기능은 이미 작동하므로 통과할 수 있음 (max 속성과 무관)

---

## 4. 테스트 실행

### 4.1 테스트 파일 생성

```bash
touch src/__tests__/unit/easy.repeatEndDateLimit.spec.ts
```

### 4.2 테스트 실행 명령어

```bash
# 전체 테스트 실행
pnpm run test

# 특정 테스트 파일만 실행
pnpm run test src/__tests__/unit/easy.repeatEndDateLimit.spec.ts

# Watch 모드
pnpm run test -- --watch
```

### 4.3 예상 Red Phase 결과

```
FAIL src/__tests__/unit/easy.repeatEndDateLimit.spec.ts
  반복 종료일 입력 제한
    TC-001: max 속성 검증
      ✗ 반복 종료일 필드에 max 속성이 2025-12-31로 설정되어 있어야 한다
        Expected the element to have attribute "max" with value "2025-12-31",
        but the attribute was not found.
    TC-002: 반복 유형별 max 속성 검증
      ✗ daily 반복 유형에서도 max 속성이 2025-12-31이어야 한다
      ✗ weekly 반복 유형에서도 max 속성이 2025-12-31이어야 한다
      ✗ monthly 반복 유형에서도 max 속성이 2025-12-31이어야 한다
      ✗ yearly 반복 유형에서도 max 속성이 2025-12-31이어야 한다
    TC-003: 반복 일정 생성 기능 검증
      ✓ 2025-12-31을 반복 종료일로 설정하여 일정을 생성할 수 있어야 한다
```

---

## 5. 테스트 구현 시 고려사항

### 5.1 React Testing Library 쿼리

- `getByLabelText`: Material-UI의 `TextField` 컴포넌트는 내부적으로 `<label>`과 `<input>`을 연결하므로, `getByLabelText`를 사용하면 실제 `<input>` 요소를 직접 반환받을 수 있다.

### 5.2 타입 캐스팅

```typescript
const repeatEndDateInput = screen.getByLabelText('반복 종료일') as HTMLInputElement;
```

- TypeScript에서 `HTMLInputElement`로 캐스팅하여 `max` 속성에 접근할 수 있도록 한다.

### 5.3 Mock API 설정

- TC-003에서는 실제 반복 일정 생성 플로우를 테스트하므로, MSW를 통해 `/api/events-list` 엔드포인트를 모킹한다.

### 5.4 비동기 처리

- `userEvent.type`, `userEvent.click` 등은 모두 비동기 함수이므로 `await`을 사용한다.
- `waitFor`를 사용하여 API 호출 후 화면 업데이트를 기다린다.

---

## 6. 체크리스트 (Poseidon)

- [x] `test_spec.md`의 모든 테스트 케이스를 구현했는가?
- [x] 테스트 코드가 TDD Red Phase를 만족하는가? (실패해야 함)
- [x] React Testing Library의 모범 사례를 따랐는가?
- [x] 타입 안정성을 확보했는가? (TypeScript)
- [x] 비동기 처리를 올바르게 했는가?
- [x] Mock 설정이 올바른가?
- [x] 테스트 코드가 가독성이 좋은가?
- [x] 테스트 코드가 유지보수 가능한가?
- [x] 의존성을 최소화했는가? (date-fns 등 사용 안 함)
- [x] 문서의 완전성을 확인했는가?
