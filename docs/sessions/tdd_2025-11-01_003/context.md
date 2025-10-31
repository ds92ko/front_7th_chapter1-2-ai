# TDD Session Context: tdd_2025-11-01_003

## Session Information

- **Session ID**: tdd_2025-11-01_003
- **Feature**: 반복 일정 수정 기능 (단일/전체 선택)
- **Created**: 2025-10-31T23:50:00+09:00
- **Last Updated**: 2025-10-31T23:50:00+09:00
- **Current Stage**: Athena (기능 명세 작성)
- **Status**: In Progress

## Feature Request

**반복 일정 수정 시 선택 다이얼로그 추가**

1. 반복 일정 수정 시 "해당 일정만 수정하시겠어요?" 다이얼로그 표시
2. "예" 선택: 해당 일정만 단일 일정으로 변경하여 수정
   - `repeat.type = 'none'` 설정
   - 반복 아이콘 사라짐
   - `PUT /api/events/:id` 호출
3. "아니오" 선택: 같은 반복 시리즈의 모든 일정 수정
   - 날짜와 시간 모두 동기화
   - 반복 아이콘 유지
   - `PUT /api/recurring-events/:repeatId` 호출
4. 단일 일정은 기존처럼 바로 수정 (다이얼로그 없음)

## Workflow Status

### Stage 1: Athena (기능 명세 작성)

- **Status**: In Progress
- **Started**: 2025-10-31T23:50:00+09:00
- **Output File**: `docs/sessions/tdd_2025-11-01_003/feature_spec.md`

### Stage 2: Artemis (테스트 설계)

- **Status**: Pending
- **Input**: `feature_spec.md`
- **Output File**: `docs/sessions/tdd_2025-11-01_003/test_spec.md`

### Stage 3: Poseidon (테스트 코드 작성 - Red)

- **Status**: Pending
- **Input**: `test_spec.md`
- **Output File**: `docs/sessions/tdd_2025-11-01_003/test_code.md`

### Stage 4: Hermes (기능 구현 - Green)

- **Status**: Pending
- **Input**: `test_code.md`, failing tests
- **Output File**: `docs/sessions/tdd_2025-11-01_003/impl_code.md`

### Stage 5: Apollo (리팩토링 - Refactor)

- **Status**: Pending
- **Input**: `impl_code.md`, passing tests
- **Output File**: `docs/sessions/tdd_2025-11-01_003/refactor_report.md`

## Constraints

1. 이미 존재하는 UI 사용 (다이얼로그 컴포넌트 활용)
2. `PUT /api/events/:id` 및 `PUT /api/recurring-events/:repeatId` API 활용
3. 기존 코드 최대한 건드리지 않고 활용
4. date-fns 등 외부 라이브러리 사용 금지
5. Apollo의 리팩토링 범위는 Hermes 코드로만 제한
6. 각 단계 완료 시 Git 커밋 필수

## API Structure (server.js 확인 완료)

- `PUT /api/events/:id`: 단일 일정 수정
- `PUT /api/recurring-events/:repeatId`: 반복 시리즈 전체 수정
  - 같은 `repeat.id`를 가진 모든 일정 수정
  - 날짜/시간/제목/설명/위치/카테고리/알림시간 동기화

## Notes

- 반복 일정 식별: `event.repeat.id` (repeatId) 사용
- 다이얼로그 조건: `repeat.type !== 'none'`
- 날짜/시간 동기화: 변경된 필드만 모든 인스턴스에 적용
