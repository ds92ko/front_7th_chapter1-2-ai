# ✍️ 테스트 코드 작성 가이드 (Test Code Writing Guide)

> **목표:** 이 문서는 '테스트 코드 작성 에이전트'가 '테스트 설계 에이전트'가 만들어낸 빈 테스트 케이스를 채워, **실패하는 테스트 코드(TDD의 Red 단계)**를 작성하는 데 필요한 구체적인 지침을 제공합니다.

---

## 1. 핵심 임무 (Core Mission)

- **주어진 것 (Inputs):**
  1.  `spec/features` 폴더의 기능 명세서 (`.md`)
  2.  `src/__tests__` 폴더의 비어있는 테스트 케이스 파일 (`.spec.ts` 또는 `.spec.tsx`)

- **해야 할 일 (Job to be Done):**
  - 기능 명세서에 기술된 요구사항을 만족하는 코드가 **아직 없기 때문에** 실패할 수밖에 없는 테스트 코드를 작성합니다.

- **산출물 (Output):**
  1. `Arrange-Act-Assert` 패턴에 따라 내용이 채워진 테스트 파일.
  2. `artifacts/code-directives/` 경로에 생성될 코드 구현 지시서 `.md` 파일.
  - 이 파일은 `pnpm test` 실행 시, 해당 테스트 케이스에서 **정확히 단언(Assert) 단계의 실패**를 일으켜야 합니다.

---

## 2. 작업 실행 프로세스 (Execution Process)

'테스트 설계 에이전트'가 만든 `describe`와 `it` 블록 내부를 아래의 단계에 따라 채워나갑니다.

### **1단계: 명세와 테스트 케이스 분석 (Analyze Spec & Test Case)**

- `it` 블록의 설명을 보고, 기능 명세서에서 이 테스트가 검증하려는 요구사항이 무엇인지 정확히 파악합니다.

### **2단계: 테스트 구조화 (Structure the Test) - AAA 패턴**

- 모든 테스트 코드는 **Arrange-Act-Assert (AAA)** 패턴을 따라 작성합니다.

  - **Arrange (준비):**
    1.  `@testing-library/react`의 `render` 함수를 사용해 테스트에 필요한 컴포넌트를 렌더링합니다.
    2.  기능 명세에 따라 필요한 Mock 데이터를 설정하거나, `src/__mocks__/handlers.ts`에 정의된 `msw` 핸들러를 사용해 API 응답을 모의 설정합니다.
    3.  `screen` 객체와 `@testing-library/user-event`를 사용해 사용자가 상호작용할 UI 요소를 찾습니다.

  - **Act (실행):**
    1.  `@testing-library/user-event`를 사용해 명세에 기술된 사용자 행동(클릭, 입력, 마우스 오버 등)을 시뮬레이션합니다.
    2.  비동기 작업(예: API 호출)이 있다면 `async/await`와 `waitFor`를 적절히 사용합니다.

  - **Assert (단언):**
    1.  `vitest`의 `expect` 함수를 사용해 **기능이 최종적으로 구현되었을 때 나타나야 할 결과**를 단언합니다.
    2.  이 단언은 **현재 시점에서는 반드시 실패해야 합니다.**
    3.  예시:
        - `expect(screen.getByText('성공 메시지')).toBeInTheDocument();`
        - `expect(mockApiFunction).toHaveBeenCalledWith(expectedPayload);`
        - `expect(inputElement).toHaveValue(expectedValue);`

---

## 3. 핵심 규칙 및 제약사항 (Key Rules & Constraints)

- **규칙 1: 반드시 실패하는 테스트를 작성하라.**
  - 테스트 실패는 문법 오류나 런타임 에러가 아닌, **`expect` 단언 실패**여야 합니다. 이는 기능이 아직 구현되지 않았음을 증명하는 가장 중요한 지표입니다.

- **규칙 2: 실제 구현 코드를 작성하지 마라.**
  - 에이전트의 역할은 'Red' 단계를 만드는 것이지, 'Green' 단계를 만드는 것이 아닙니다. `src` 폴더의 컴포넌트나 유틸리티 함수를 수정해서는 안 됩니다.

- **규칙 3: 프로젝트의 테스트 도구를 사용하라.**
  - **테스트 러너/프레임워크:** `vitest`
  - **테스팅 라이브러리:** `@testing-library/react`, `@testing-library/user-event`
  - **API 모킹:** `msw` (`src/__mocks__/handlers.ts` 활용)

- **규칙 4: 기존 코드 스타일을 준수하라.**
  - 프로젝트 내 다른 테스트 파일(`*.spec.ts`)의 코드 스타일, 네이밍 컨벤션, форматирование을 일관되게 따릅니다.

- **규칙 5: 완전하고 독립적인 테스트를 만들어라.**
  - 각 `it` 블록은 다른 테스트에 의존하지 않고 독립적으로 실행될 수 있어야 합니다. 필요한 모든 설정(Arrange)은 해당 블록 내에서 완료되어야 합니다.

# ✍️ 테스트 코드 작성 가이드 (Test Code Writing Guide)

> **목표:** 이 문서는 '테스트 코드 작성 에이전트'가 '테스트 설계 에이전트'가 만들어낸 빈 테스트 케이스를 채워, **실패하는 테스트 코드(TDD의 Red 단계)**를 작성하는 데 필요한 구체적인 지침을 제공합니다.

---

## 1. 핵심 임무 (Core Mission)

- **주어진 것 (Inputs):**
  1.  `spec/features` 폴더의 기능 명세서 (`.md`)
  2.  `src/__tests__` 폴더의 비어있는 테스트 케이스 파일 (`.spec.ts` 또는 `.spec.tsx`)

- **해야 할 일 (Job to be Done):**
  - 기능 명세서에 기술된 요구사항을 만족하는 코드가 **아직 없기 때문에** 실패할 수밖에 없는 테스트 코드를 작성합니다.

- **산출물 (Output):**
  1. `Arrange-Act-Assert` 패턴에 따라 내용이 채워진 테스트 파일.
  2. `artifacts/code-directives/` 경로에 생성될 코드 구현 지시서 `.md` 파일.
  - 이 파일은 `pnpm test` 실행 시, 해당 테스트 케이스에서 **정확히 단언(Assert) 단계의 실패**를 일으켜야 합니다.

---

## 2. 작업 실행 프로세스 (Execution Process)

'테스트 설계 에이전트'가 만든 `describe`와 `it` 블록 내부를 아래의 단계에 따라 채워나갑니다.

### **1단계: 명세와 테스트 케이스 분석 (Analyze Spec & Test Case)**

- `it` 블록의 설명을 보고, 기능 명세서에서 이 테스트가 검증하려는 요구사항이 무엇인지 정확히 파악합니다.

### **2단계: 테스트 구조화 (Structure the Test) - AAA 패턴**

- 모든 테스트 코드는 **Arrange-Act-Assert (AAA)** 패턴을 따라 작성합니다.

  - **Arrange (준비):**
    1.  `@testing-library/react`의 `render` 함수를 사용해 테스트에 필요한 컴포넌트를 렌더링합니다.
    2.  기능 명세에 따라 필요한 Mock 데이터를 설정하거나, `src/__mocks__/handlers.ts`에 정의된 `msw` 핸들러를 사용해 API 응답을 모의 설정합니다.
    3.  `screen` 객체와 `@testing-library/user-event`를 사용해 사용자가 상호작용할 UI 요소를 찾습니다.

  - **Act (실행):**
    1.  `@testing-library/user-event`를 사용해 명세에 기술된 사용자 행동(클릭, 입력, 마우스 오버 등)을 시뮬레이션합니다.
    2.  비동기 작업(예: API 호출)이 있다면 `async/await`와 `waitFor`를 적절히 사용합니다.

  - **Assert (단언):**
    1.  `vitest`의 `expect` 함수를 사용해 **기능이 최종적으로 구현되었을 때 나타나야 할 결과**를 단언합니다.
    2.  이 단언은 **현재 시점에서는 반드시 실패해야 합니다.**
    3.  예시:
        - `expect(screen.getByText('성공 메시지')).toBeInTheDocument();`
        - `expect(mockApiFunction).toHaveBeenCalledWith(expectedPayload);`
        - `expect(inputElement).toHaveValue(expectedValue);`

---

## 3. 핵심 규칙 및 제약사항 (Key Rules & Constraints)

- **규칙 1: 반드시 실패하는 테스트를 작성하라.**
  - 테스트 실패는 문법 오류나 런타임 에러가 아닌, **`expect` 단언 실패**여야 합니다. 이는 기능이 아직 구현되지 않았음을 증명하는 가장 중요한 지표입니다.

- **규칙 2: 실제 구현 코드를 작성하지 마라.**
  - 에이전트의 역할은 'Red' 단계를 만드는 것이지, 'Green' 단계를 만드는 것이 아닙니다. `src` 폴더의 컴포넌트나 유틸리티 함수를 수정해서는 안 됩니다.

- **규칙 3: 프로젝트의 테스트 도구를 사용하라.**
  - **테스트 러너/프레임워크:** `vitest`
  - **테스팅 라이브러리:** `@testing-library/react`, `@testing-library/user-event`
  - **API 모킹:** `msw` (`src/__mocks__/handlers.ts` 활용)

- **규칙 4: 기존 코드 스타일을 준수하라.**
  - 프로젝트 내 다른 테스트 파일(`*.spec.ts`)의 코드 스타일, 네이밍 컨벤션, форматирование을 일관되게 따릅니다.

- **규칙 5: 완전하고 독립적인 테스트를 만들어라.**
  - 각 `it` 블록은 다른 테스트에 의존하지 않고 독립적으로 실행될 수 있어야 합니다. 필요한 모든 설정(Arrange)은 해당 블록 내에서 완료되어야 합니다.

- **규칙 6: 코드 구현 지시서를 작성하라.**
  - 실패하는 테스트를 통과시키기 위해 필요한 프로덕션 코드의 변경사항(어떤 파일에 어떤 함수/컴포넌트를 추가/수정해야 하는지)을 `artifacts/code-directives/` 경로에 `code-implementation-directive-template.md` 템플릿을 사용하여 `.md` 파일로 상세히 작성해야 합니다. 이 문서는 `코드 작성 에이전트`가 작업을 시작할 수 있는 명확한 가이드라인을 제공해야 합니다.

---

## 4. RTL 철학 및 모범 사례 (RTL Philosophy & Best Practices)

> **핵심 철학: "테스트가 소프트웨어를 사용하는 방식과 유사할수록, 더 큰 확신을 줍니다."

- **사용자 행동을 테스트하라:** 컴포넌트의 내부 상태나 구현 디테일을 테스트하지 않습니다. 사용자가 보고 상호작용하는 것을 중심으로 테스트를 작성합니다. (예: `useState`의 값이 `true`인지 확인하는 대신, 그로 인해 화면에 나타나는 텍스트가 있는지 확인합니다.)

- **접근성을 우선하는 쿼리를 사용하라:** 사용자가 요소를 찾는 방식을 흉내 내는 쿼리를 우선적으로 사용합니다. 이는 자연스럽게 접근성이 높은 애플리케이션을 만들도록 유도합니다.
  - **쿼리 우선순위:**
    1.  `getByRole`: 가장 우선순위가 높습니다. (a, button, heading, ... )
    2.  `getByLabelText`: Form 필드를 찾는 가장 좋은 방법입니다.
    3.  `getByPlaceholderText`
    4.  `getByText`
    5.  `getByDisplayValue`
    6.  `getByAltText` (img), `getByTitle` (svg, iframe)
    7.  `getByTestId`: 위 쿼리로 찾을 수 없을 때 사용하는 최후의 수단입니다.

- **`getBy`, `queryBy`, `findBy`를 구분하여 사용하라:**
  - `getBy*`: 요소가 반드시 존재할 것이라 예상될 때 사용합니다. 없으면 에러가 발생합니다.
  - `queryBy*`: 요소가 화면에 없는 상태를 검증할 때 사용합니다. 없으면 `null`을 반환합니다.
  - `findBy*`: 비동기적으로 나타날 요소를 기다릴 때 사용합니다. `Promise`를 반환합니다.

---

## 5. 주요 안티패턴 (Key Anti-Patterns)

- **구현 세부사항 테스트:**
  - **무엇이 문제인가?** 컴포넌트의 내부 상태(`useState`), props, 내부 함수 등을 직접 테스트하는 것은 리팩토링 시 테스트를 쉽게 깨지게 만듭니다. 기능은 동일해도 내부 구조가 바뀌면 테스트가 실패하는 '취약한 테스트'가 됩니다.
  - **어떻게 해야 하는가?** 항상 사용자 관점에서 보이는 결과(UI 변경)를 테스트합니다.

- **`data-testid` 남용:**
  - **무엇이 문제인가?** `getByTestId`에만 의존하면, 사용자가 실제로 상호작용할 수 없는(접근성 낮은) 코드를 작성해도 테스트는 통과할 수 있습니다.
  - **어떻게 해야 하는가?** `getByRole`, `getByLabelText` 등 의미론적 쿼리를 최대한 사용하고, `data-testid`는 최후의 보루로 남겨둡니다.

- **`fireEvent` 대신 `user-event` 사용하기:**
  - **무엇이 문제인가?** `fireEvent`는 단일 이벤트를 발생시키지만, `user-event`는 실제 사용자가 상호작용하는 것처럼 여러 이벤트를 순서대로 발생시켜 더 현실적인 테스트를 가능하게 합니다. (예: `userEvent.click()`은 `hover`, `focus`, `click` 이벤트를 모두 포함할 수 있습니다.)
  - **어떻게 해야 하는가?** 특별한 이유가 없다면 항상 `@testing-library/user-event`를 사용합니다.

- **비동기 처리를 기다리지 않기:**
  - **무엇이 문제인가?** API 요청 후 UI가 변경되는 상황에서 `waitFor`나 `findBy*` 없이 단언하면, 단언문이 실행되는 시점에는 아직 UI가 업데이트되지 않아 테스트가 실패할 수 있습니다. (Flaky Test)
  - **어떻게 해야 하는가?** 비동기 업데이트를 검증할 때는 반드시 `findBy*` 또는 `waitFor`를 사용해 DOM 변경을 기다립니다.

---

## 6. 간단한 예시

- **Before (테스트 설계 에이전트의 결과물):**
  ```typescript
  it('로그인 버튼을 클릭하면, 환영 메시지가 나타나야 한다', () => {
    // TODO: 테스트 코드 작성 에이전트가 이 부분을 채워야 함
  });
  ```

- **After (테스트 코드 작성 에이전트의 결과물):**
  ```typescript
  it('로그인 버튼을 클릭하면, 환영 메시지가 나타나야 한다', async () => {
    // Arrange
    render(<LoginComponent />);
    const emailInput = screen.getByLabelText('이메일');
    const passwordInput = screen.getByLabelText('비밀번호');
    const loginButton = screen.getByRole('button', { name: '로그인' });

    // Act
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(loginButton);

    // Assert
    // '환영합니다, test@example.com님!' 메시지는 아직 구현되지 않았으므로 이 테스트는 실패한다.
    expect(await screen.findByText('환영합니다, test@example.com님!')).toBeInTheDocument();
  });
  ```


---

## 4. RTL 철학 및 모범 사례 (RTL Philosophy & Best Practices)

> **핵심 철학: "테스트가 소프트웨어를 사용하는 방식과 유사할수록, 더 큰 확신을 줍니다."

- **사용자 행동을 테스트하라:** 컴포넌트의 내부 상태나 구현 디테일을 테스트하지 않습니다. 사용자가 보고 상호작용하는 것을 중심으로 테스트를 작성합니다. (예: `useState`의 값이 `true`인지 확인하는 대신, 그로 인해 화면에 나타나는 텍스트가 있는지 확인합니다.)

- **접근성을 우선하는 쿼리를 사용하라:** 사용자가 요소를 찾는 방식을 흉내 내는 쿼리를 우선적으로 사용합니다. 이는 자연스럽게 접근성이 높은 애플리케이션을 만들도록 유도합니다.
  - **쿼리 우선순위:**
    1.  `getByRole`: 가장 우선순위가 높습니다. (a, button, heading, ... )
    2.  `getByLabelText`: Form 필드를 찾는 가장 좋은 방법입니다.
    3.  `getByPlaceholderText`
    4.  `getByText`
    5.  `getByDisplayValue`
    6.  `getByAltText` (img), `getByTitle` (svg, iframe)
    7.  `getByTestId`: 위 쿼리로 찾을 수 없을 때 사용하는 최후의 수단입니다.

- **`getBy`, `queryBy`, `findBy`를 구분하여 사용하라:**
  - `getBy*`: 요소가 반드시 존재할 것이라 예상될 때 사용합니다. 없으면 에러가 발생합니다.
  - `queryBy*`: 요소가 화면에 없는 상태를 검증할 때 사용합니다. 없으면 `null`을 반환합니다.
  - `findBy*`: 비동기적으로 나타날 요소를 기다릴 때 사용합니다. `Promise`를 반환합니다.

---

## 5. 주요 안티패턴 (Key Anti-Patterns)

- **구현 세부사항 테스트:**
  - **무엇이 문제인가?** 컴포넌트의 내부 상태(`useState`), props, 내부 함수 등을 직접 테스트하는 것은 리팩토링 시 테스트를 쉽게 깨지게 만듭니다. 기능은 동일해도 내부 구조가 바뀌면 테스트가 실패하는 '취약한 테스트'가 됩니다.
  - **어떻게 해야 하는가?** 항상 사용자 관점에서 보이는 결과(UI 변경)를 테스트합니다.

- **`data-testid` 남용:**
  - **무엇이 문제인가?** `getByTestId`에만 의존하면, 사용자가 실제로 상호작용할 수 없는(접근성 낮은) 코드를 작성해도 테스트는 통과할 수 있습니다.
  - **어떻게 해야 하는가?** `getByRole`, `getByLabelText` 등 의미론적 쿼리를 최대한 사용하고, `data-testid`는 최후의 보루로 남겨둡니다.

- **`fireEvent` 대신 `user-event` 사용하기:**
  - **무엇이 문제인가?** `fireEvent`는 단일 이벤트를 발생시키지만, `user-event`는 실제 사용자가 상호작용하는 것처럼 여러 이벤트를 순서대로 발생시켜 더 현실적인 테스트를 가능하게 합니다. (예: `userEvent.click()`은 `hover`, `focus`, `click` 이벤트를 모두 포함할 수 있습니다.)
  - **어떻게 해야 하는가?** 특별한 이유가 없다면 항상 `@testing-library/user-event`를 사용합니다.

- **비동기 처리를 기다리지 않기:**
  - **무엇이 문제인가?** API 요청 후 UI가 변경되는 상황에서 `waitFor`나 `findBy*` 없이 단언하면, 단언문이 실행되는 시점에는 아직 UI가 업데이트되지 않아 테스트가 실패할 수 있습니다. (Flaky Test)
  - **어떻게 해야 하는가?** 비동기 업데이트를 검증할 때는 반드시 `findBy*` 또는 `waitFor`를 사용해 DOM 변경을 기다립니다.

---

## 6. 간단한 예시

- **Before (테스트 설계 에이전트의 결과물):**
  ```typescript
  it('로그인 버튼을 클릭하면, 환영 메시지가 나타나야 한다', () => {
    // TODO: 테스트 코드 작성 에이전트가 이 부분을 채워야 함
  });
  ```

- **After (테스트 코드 작성 에이전트의 결과물):**
  ```typescript
  it('로그인 버튼을 클릭하면, 환영 메시지가 나타나야 한다', async () => {
    // Arrange
    render(<LoginComponent />);
    const emailInput = screen.getByLabelText('이메일');
    const passwordInput = screen.getByLabelText('비밀번호');
    const loginButton = screen.getByRole('button', { name: '로그인' });

    // Act
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(loginButton);

    // Assert
    // '환영합니다, test@example.com님!' 메시지는 아직 구현되지 않았으므로 이 테스트는 실패한다.
    expect(await screen.findByText('환영합니다, test@example.com님!')).toBeInTheDocument();
  });
  ```
