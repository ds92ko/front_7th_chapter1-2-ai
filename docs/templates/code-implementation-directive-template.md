# 📝 코드 구현 지시서 템플릿 (Code Implementation Directive Template)

> **목표:** 이 템플릿은 '테스트 코드 작성 에이전트 (포세이돈)'가 생성하는 '코드 구현 지시서'의 표준 형식을 정의합니다. 이 문서는 '코드 작성 에이전트 (헤르메스)'가 실패하는 테스트를 통과시키기 위해 어떤 프로덕션 코드를 어디에 작성하거나 수정해야 하는지에 대한 명확한 가이드라인을 제공합니다.

---

## 1. 개요 (Overview)

- **관련 기능 명세서:** [기능 명세서 파일 경로 및 이름]
- **관련 테스트 파일:** [실패하는 테스트 파일 경로 및 이름]
- **지시서 생성일:** {{YYYY-MM-DD}}

---

## 2. 구현 목표 (Implementation Goal)

> (이 지시서가 목표하는 바를 간략하게 설명합니다. 예: "관련 테스트 파일의 모든 `expect` 단언문을 통과시키기 위한 프로덕션 코드 구현")

---

## 3. 대상 프로덕션 파일 및 변경 사항 (Target Production Files & Changes)

(아래 형식에 따라, 수정하거나 새로 생성해야 할 프로덕션 파일 목록과 각 파일별 변경 사항을 상세히 기술합니다.)

### 3.1. 파일 경로: `src/components/ExampleComponent.tsx`

- **변경 유형:** [신규 생성 / 기존 파일 수정]
- **필요한 변경 사항:**
  - `ExampleComponent` 컴포넌트 내부에 `handleButtonClick` 함수를 구현해야 합니다.
  - `useState`를 사용하여 `isLoading` 상태를 관리해야 합니다.
  - `useEffect`를 사용하여 컴포넌트 마운트 시 데이터를 불러오는 로직을 추가해야 합니다.
- **예상 코드 스니펫 (선택 사항):**
  ```typescript
  // 예시: 새로운 함수 시그니처
  const handleButtonClick = () => {
    // ... 구현 내용
  };

  // 예시: 새로운 컴포넌트 구조
  const ExampleComponent = () => {
    // ...
  };
  ```

### 3.2. 파일 경로: `src/utils/api.ts`

- **변경 유형:** [신규 생성 / 기존 파일 수정]
- **필요한 변경 사항:**
  - `fetchUserData` API 호출 함수를 추가해야 합니다.
  - 에러 핸들링 로직을 포함해야 합니다.
- **예상 코드 스니펫 (선택 사항):**
  ```typescript
  // 예시: 새로운 함수 시그니처
  export const fetchUserData = async (userId: string) => {
    // ...
  };
  ```

---

## 4. 추가 컨텍스트 및 참고 사항 (Additional Context & Notes)

> (헤르메스가 코드를 작성하는 데 도움이 될 만한 추가적인 정보나 주의사항을 기술합니다. 예: "데이터 포맷은 `types.ts`의 `User` 인터페이스를 참고하세요.")
