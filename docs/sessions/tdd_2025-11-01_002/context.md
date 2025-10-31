# TDD Session Context: tdd_2025-11-01_002

## Session Information

- **Session ID**: tdd_2025-11-01_002
- **Feature**: 반복 종료일 입력 제한 (2025-12-31까지)
- **Created**: 2025-10-31T23:45:00+09:00
- **Last Updated**: 2025-10-31T23:45:00+09:00
- **Current Stage**: Athena (기능 명세 작성)
- **Status**: In Progress

## Feature Request

- 반복 종료일 입력 필드에 최대 날짜 제한 추가
- 2025-12-31 이후의 날짜는 선택 불가능하게 제한
- `<input type="date" max="2025-12-31">` 속성 추가

## Workflow Status

### Stage 1: Athena (기능 명세 작성)

- **Status**: In Progress
- **Started**: 2025-10-31T23:45:00+09:00
- **Output File**: `docs/sessions/tdd_2025-11-01_002/feature_spec.md`

### Stage 2: Artemis (테스트 설계)

- **Status**: Pending
- **Input**: `feature_spec.md`
- **Output File**: `docs/sessions/tdd_2025-11-01_002/test_spec.md`

### Stage 3: Poseidon (테스트 코드 작성 - Red)

- **Status**: Pending
- **Input**: `test_spec.md`
- **Output File**: `docs/sessions/tdd_2025-11-01_002/test_code.md`

### Stage 4: Hermes (기능 구현 - Green)

- **Status**: Pending
- **Input**: `test_code.md`, failing tests
- **Output File**: `docs/sessions/tdd_2025-11-01_002/impl_code.md`

### Stage 5: Apollo (리팩토링 - Refactor)

- **Status**: Pending
- **Input**: `impl_code.md`, passing tests
- **Output File**: `docs/sessions/tdd_2025-11-01_002/refactor_report.md`

## Constraints

1. 이미 존재하는 UI를 사용 (기존 input 태그만 수정)
2. 기존 로직 변경 최소화 (UI 속성만 변경)
3. 테스트 작성 시 date-fns 등 외부 라이브러리 사용 금지
4. Apollo의 리팩토링 범위는 Hermes의 코드로만 제한
5. 각 단계 완료 시 Git 커밋 필수

## Notes

- 매우 간단한 UI 속성 추가 작업
- 기존 반복 일정 생성 로직은 전혀 변경하지 않음
- 브라우저 기본 기능을 활용하여 입력 제한
