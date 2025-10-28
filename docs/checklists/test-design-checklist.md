# ✅ Artemis Test Design Quality Checklist

> **관리 위치:** docs/checklists/test-design-checklist.md
> **작성자:** Artemis (Test Design Agent)
> **최종 업데이트:** 2025-10-28

---

## 🏹 Artemis 테스트 설계 품질 체크리스트

- [ ] 테스트 설계 파일 저장 경로(예: src/**tests**/[feature].spec.ts[x]) 준수
- [ ] Athena 명세 기반으로 테스트 케이스 설계됨
- [ ] Project Test Guide, Test Writing Best Practices 등 참고 문서 반영
- [ ] Goals와 Non-Goals(테스트 범위/비범위) 명확히 구분
- [ ] GIVEN-WHEN-THEN(AAA) 구조로 테스트 설명 작성
- [ ] 핵심 시나리오/엣지 케이스(경계값, 오류 등) 최소 3개 이상 포함
- [ ] TDD 원칙(RED-GREEN-REFACTOR) 기반 설계
- [ ] FIRST 원칙(Fast, Independent, Repeatable, Self-validating, Timely) 준수
- [ ] 테스트명은 한글 서술형, 의도/조건/결과 명확
- [ ] 기존 setupTests.ts 등 공통 설정 중복 없이 활용
- [ ] Mock/Stub/Spy 전략 명확히 구분(외부 의존성만 모킹)
- [ ] DAMP 원칙(명확성 우선, 중복 허용) 적용
- [ ] 테스트 코드 품질 원칙(유지보수성, 가독성, 신뢰성, 격리성, 빠른 실행) 반영
- [ ] 안티패턴(내부 구현 테스트, 거대 스냅샷, 테스트 간 의존성, 과도한 expect, 불필요한 커버리지) 피함
- [ ] 커버리지 목표(85% 이상, 의미 있는 테스트만) 명시
- [ ] 각 계층(Unit, Hook, Integration)별 책임/Mock 전략 구분
- [ ] 테스트 케이스/파일 상단에 버전 정보 명시
- [ ] CHANGELOG 섹션에 변경 이력 기록
- [ ] 관련 이슈/PR 번호 연결됨
- [ ] 승인자 및 승인 일자 기록됨
- [ ] 도메인/기술 용어 일관성 유지 (Event, Calendar, Repeat 등)
- [ ] 약어는 첫 언급 시 풀네임 병기
- [ ] 용어사전 섹션에 핵심 용어 정의됨
- [ ] 주요 기술 스택(React, TypeScript, Vitest 등) 호환성 확인
- [ ] 테스트 전략이 프로젝트 표준에 부합하는지 확인
- [ ] 핵심 도메인 로직과의 연관성 분석
- [ ] 성능 목표 및 품질 기준 명확화 (예: 실행 시간, 실패율 등)
- [ ] 경고/알림/검증 로직의 정확도 목표 및 보장 방안 명시
- [ ] 데이터 계약(인터페이스/스키마 등) 준수 확인
- [ ] 자체 검토 완료 (논리적 일관성, 오타 등)
- [ ] 이해관계자 승인 프로세스 명시
- [ ] 추후 질문사항 Open Questions에 정리
- [ ] 다음 단계 액션 아이템 명확화

> **이 체크리스트는 Artemis 테스트 설계 품질 검증의 표준입니다.**
