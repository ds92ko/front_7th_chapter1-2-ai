# 📝 TDD 파이프라인 컨텍스트 (context.md)

> 이 문서는 Zeus 에이전트가 관리하는 멀티 에이전트 TDD 개발 파이프라인의 전체 진행 상태를 기록하는 메인 상태 문서입니다. 현재 단계, 각 에이전트의 완료 여부, 그리고 생성된 주요 산출물 파일의 경로를 포함합니다.

---

## 1. 🌟 전체 진행 상태

- **`overall_status`**: [진행 상태: `✅ completed`, `🔄 in_progress`, `❌ failed`]
- **`current_stage`**: [현재 진행 중인 단계: `Athena`, `Artemis`, `Poseidon`, `Hermes`, `Apollo`, `completed`]
- **`last_updated`**: [YYYY-MM-DD HH:MM:SS]

---

## 2. 🚀 에이전트별 완료 상태

| 에이전트명   | 상태                                 | 완료 시간 (YYYY-MM-DD HH:MM:SS) |
| :----------- | :----------------------------------- | :------------------------------ |
| **Athena**   | [✅ done, 🔄 in_progress, ❌ failed] | [YYYY-MM-DD HH:MM:SS]           |
| **Artemis**  | [✅ done, 🔄 in_progress, ❌ failed] | [YYYY-MM-DD HH:MM:SS]           |
| **Poseidon** | [✅ done, 🔄 in_progress, ❌ failed] | [YYYY-MM-DD HH:MM:SS]           |
| **Hermes**   | [✅ done, 🔄 in_progress, ❌ failed] | [YYYY-MM-DD HH:MM:SS]           |
| **Apollo**   | [✅ done, 🔄 in_progress, ❌ failed] | [YYYY-MM-DD HH:MM:SS]           |
<!-- ⚠️ 중요: 위의 '완료 시간'은 반드시 해당 단계가 완료된 '정확한 현재 시스템 시간'으로 기록해야 합니다. 절대 이전 시간을 복사하거나 임의의 값을 사용해서는 안 됩니다. -->

---

## 3. 📁 주요 산출물 파일 경로

각 에이전트가 생성한 주요 산출물 파일의 경로입니다.

- **`feature_spec.md`**: [docs/sessions/tdd_YYYY-MM-DD_NNN/feature_spec.md 또는 `(생성 전)`]
- **`test_spec.md`**: [docs/sessions/tdd_YYYY-MM-DD_NNN/test_spec.md 또는 `(생성 전)`]
- **`test_code.md`**: [docs/sessions/tdd_YYYY-MM-DD_NNN/test_code.md 또는 `(생성 전)`]
- **`impl_code.md`**: [docs/sessions/tdd_YYYY-MM-DD_NNN/impl_code.md 또는 `(생성 전)`]
- **`refactor_report.md`**: [docs/sessions/tdd_YYYY-MM-DD_NNN/refactor_report.md 또는 `(생성 전)`]

---

## 4. 📚 관련 문서 및 참조

- **`agents_spec.md`**: 시스템 전체 명세
- **`zeus_card.md`**: Zeus 에이전트 카드
- **`zeus_guide.md`**: Zeus 에이전트 작업 가이드라인
- **`zeus_checklist.md`**: Zeus 에이전트 작업 체크리스트

---

## 📝 변경 이력

| 버전 | 날짜       | 변경 내용 | 작성자 |
| :--- | :--------- | :-------- | :----- |
| 1.0  | 2025-10-30 | 최초 작성 | Gemini |
