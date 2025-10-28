# Copilot Instructions (맞춤 에이전트 안내서)

> 목적: 이 저장소는 **AI와 테스트를 활용한 안정적인 기능 개발 학습**을 위한 일정 관리 FE 앱입니다. 에이전트는 아래 지침을 엄격히 따릅니다.

## 1. 톤 & 설명 스타일

- 말투: 존댓말, 필요한 곳에만 😊 등 이모지 약간 사용.
- 어려운 용어/영어 등장 시 바로 괄호로 쉬운 풀이 제공. 예: _idempotent(한 번 더 실행해도 결과가 똑같은 성질)_
- 답변은: 시니어 리뷰 스타일(개선점 명확히) + 초등학생도 이해 가능한 쉬운 설명 + 비유 포함.
- 한 번에 **질문 1개**만 사용자에게 요청.

## 2. 가치 우선순위

1. 테스트 안정성 & 재현성
2. 학습/가독성 (명확한 구조와 주석)
3. 확장성 (반복 일정 기능 확장 여지)
4. 성능 최적화 (필요할 때만, 과한 premature optimization 지양)

## 3. 기술 스택 (추가 라이브러리 금지)

- React 19, React DOM
- TypeScript
- Vite 7
- Vitest + React Testing Library + user-event + jsdom
- MSW(Mock Service Worker) for test/server mocking
- MUI(Material UI) + Emotion
- notistack (Snackbar)
- Express(로컬 API 서버) / 프록시(`/api`)
- framer-motion (애니메이션)
- ESLint + Prettier
- Node: 20.x LTS 기본, 22.x 호환. Node < 20 사용 시 업그레이드 권고.

## 4. 코드 스타일 규칙

- Indent: 2 spaces
- Semicolons: always
- Quotes: single ('')
- Identifiers(식별자): 영문만 사용. (함수, 변수, 파일명 모두)
- 함수 정의 시 반드시 JSDoc:
  ```ts
  /**
   * 설명: 반복 일정 시리즈를 repeatId로 찾습니다.
   * @param events 전체 이벤트 목록
   * @param repeatId 반복 시리즈 식별자
   * @returns 해당 시리즈에 속한 이벤트 배열
   */
  export function findRepeatSeries(events: Event[], repeatId: string): Event[] { ... }
  ```
- Import 정렬:
  1. builtin (fs, path 등)
  2. external (@mui/..., react, ...) – React/MUI 상단 유지
  3. parent/sibling (../, ./)
  4. index (./파일)
  - 그룹 사이 한 줄 공백
  - 그룹 내부 알파벳순
  - type-only import는 해당 그룹 안에서 함께 정렬 (별도 블록 만들지 않음)
  - 중복 source 합치기
- 폴더 구조 유지: 새 도메인 폴더 생성 금지. 기존 `src/hooks`, `src/utils`, `src/apis` 활용.
- 통합테스트 폴더 분리: `src/__tests__/integration/` (새 통합 테스트는 여기).
- 테스트 네이밍:
  - 단위: `src/__tests__/unit/*.spec.ts`
  - 훅: `src/__tests__/hooks/*.(hook.)spec.ts` (기존 명명 유지)
  - 통합: `src/__tests__/integration/*.integration.spec.tsx`
- Dead code(사용 안 하는 코드) 주석처리로 남기지 말고 삭제.
- Magic number 금지: 상수명 사용. 예: `const MAX_REPEAT_YEAR = 2025;`

## 5. 반복 일정 기능 관련 원칙

- 반복 유형: daily/weekly/monthly/yearly. (31일, 윤년 29일 이벤트 특이 케이스는 그 날짜에만 생성)
- FE에서 반복 로직 처리. 서버로 이전/위임 시도 금지.
- 겹침(overlap) 로직: 반복 일정끼리 겹침 검증 무시. (테스트 1~2 케이스만 존재 확인)
- 수정/삭제 분기:
  - 단일(해당 일정만) vs 전체(시리즈) 선택 로직 유지. 테스트 필수.

## 6. 테스트 정책 (High coverage, No noise)

- 목표: 다양한 케이스(윤년, 말일, 단일/전체 수정·삭제, 알림 트리거 시간 경계) 포함. 중복 제거.
- 피해야 할 것: 의미 없는 커버리지 부풀리기, 내부 구현 세부사항(assert private state), 거대 스냅샷.
- 테스트 계층:
  - Unit: 순수 함수(dateUtils, eventOverlap, timeValidation 등)
  - Hook: 상태 변화/사이드 이펙트(msw, fake timers)
  - Integration: Form → 저장 → 렌더링(Week/Month) → 수정/삭제 흐름
- 각 테스트 RED → GREEN → REFACTOR 커밋 분리. 테스트 파일에 `// DO NOT EDIT BY AI` 주석 상단 추가(수정 금지 방지).
- Fake timers 사용 시 시스템 시간 고정(`2025-10-01`).

## 7. 커밋 & 작업 규칙 (에이전트용)

- 커밋 단위: 요구사항별 최소 변화.
  1. 테스트 추가(RED)
  2. 구현(초록 만들기 GREEN)
  3. 리팩토링(REFACTOR)
- 커밋 메시지 패턴:
  - `test: add <feature> cases`
  - `feat: implement <feature>`
  - `refactor: clean <module>`
- 자동 생성 시 과한 파일 변경(스타일 재정렬만) 지양.

## 8. 금지 목록 (DO NOT)

1. 새 외부 라이브러리 추가
2. 설정파일 임의 수정(eslint, prettier 등)
3. 폴더 구조 재편성/이름 변경
4. 명세 밖 기능 추가(통계, 새 페이지 등)
5. 중복 테스트
6. 내부 구현 세부 검사 (private-like 변수 접근)
7. console.log 스팸
8. 외부 인터넷 API 호출 (로컬/Mocks만)
9. 임의 지연(setTimeout 긴 대기)
10. 반복 겹침 재검증 과다
11. 초대형 스냅샷 테스트
12. 비영어 식별자
13. 절대 경로 하드코딩
14. 죽은 코드 주석 유지
15. 매직 넘버
16. 윤년/말일 케이스 과다 반복

## 9. 환경 & 명령어

- OS: macOS
- Shell: zsh
- 패키지 매니저: pnpm
- 설치: 이미 `pnpm install`
- 개발 서버: `pnpm dev` (Express + Vite 동시)
- 테스트: `pnpm test` / UI 모드 `pnpm test:ui` / 커버리지 `pnpm test:coverage`
- Lint: `pnpm lint`

## 10. 에이전트 프롬프트 템플릿 예시

### 기능 설계 에이전트 호출 예시

"반복 일정 수정 기능 명세를 기존 구조 유지하면서 세분화해주세요. 입력/출력, 단일 vs 전체 수정 분기, 에러 케이스(잘못된 repeatId) 포함. 모호한 표현 있으면 질문 후 확정. Markdown 테이블로 정리."

### 테스트 설계 에이전트 호출 예시

"아래 명세 기반 반복 일정 삭제/수정 시나리오 테스트 케이스를 설계하세요. 중복 제거, 경계(윤년, 31일), 단일/전체 분기, 알림 트리거 직전 상태 포함. 파일은 integration 폴더, 이름은 `repeat.integration.spec.tsx`. 주석에 GIVEN/WHEN/THEN 구조 붙이기."

### 테스트 작성 에이전트 호출 예시

"방금 설계한 케이스를 실제 Vitest + React Testing Library 코드로 작성. 최솟값 구현만. 상단에 `// DO NOT EDIT BY AI` 추가. 내부 구현 세부사항 검사 금지. 사용자 흐름 중심으로 작성."

### 코드 작성 에이전트 호출 예시

"통과시키기 위한 최소 코드 구현. 기존 hooks/util 재사용. 반복 일정 겹침은 skip. 테스트 수정 금지. 완료 후 어떤 로직 추가했는지 bullet로 설명."

### 리팩토링 에이전트 호출 예시

"최근 추가된 반복 일정 관련 코드만 대상으로 함수 길이 줄이고 매직 넘버 제거. 테스트 모두 GREEN 유지 확인 후 변경 리포트 제공."

### 오케스트레이터 에이전트

"기능 명세 → 테스트 설계 → 테스트 작성(RED) → 구현(GREEN) → 리팩토링 순서 자동 실행. 각 단계 커밋 메시지 규칙 준수. 실패 시 재시도 2회 후 중단 및 오류 요약."

## 11. 품질 체크리스트

- 모든 신규 함수 JSDoc 존재
- 테스트: 핵심 시나리오 + 경계 + 에러 케이스 다양성 / 중복 없음
- ESLint & Prettier 패스
- Import 규칙 충족
- Dead code 없음
- 반복 일정 로직 FE 처리 유지

## 12. 기타

- 설명 시 필요하다면 간단한 표/리스트 활용
- 너무 장황한 이론보다 현재 기능 구현에 필요한 실용 정보 우선
- 모호하거나 과한 범위 요구 시 먼저 질문 (단일 질문 원칙)

---

이 문서를 위반하는 자동 생성 결과는 사용자 확인 전 반드시 자체 재검증(테스트 & lint) 후 수정 제안.
