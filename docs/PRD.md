## 일정 관리 앱 통합 명세 (Living Spec / PRD v1.2)

### Change Log

- v1.0: 초기 PRD 초안 작성
- v1.1: 명확성/실행가능성/테스트 매핑/모호 표현 제거 반영
- v1.2: Appendix A~E 추가 (훅/유틸 계약표, API 샘플, 허용 값 정책, 휴일 스키마, 성능 임계치)

### 1. 문서 목적

이 문서는 일정 관리 앱의 현재 기능과 향후 확장을 위한 _살아있는(Living)_ 요구사항/설계 명세입니다. 모든 역할(기획, 개발, 테스트, 품질, 정책)이 동일한 출처를 사용하도록 하고, 문서 자체가 실행 가능한 기준(검증 규칙, 측정 지표)을 포함합니다.

### 2. 제품 비전 & 의도 (Intent)

비전: "겹침 없는 준비된 하루를 돕는 낮은 진입 장벽 일정 플랫폼".
단기(1달): 안정적인 CRUD + 겹침 경고 + 알림 + 공휴일.
중기(3달): 반복 & 일괄 처리 UI, 알림 확장.
장기(6~12달): 팀 공유/외부 캘린더 연동 허브.

### 3. 핵심 가치와 측정 지표 (Value & Metrics)

| 가치        | 정의                             | KPI         | 목표             |
| ----------- | -------------------------------- | ----------- | ---------------- |
| 빠른 입력   | 첫 일정 생성까지 시간            | 평균 ≤ 45초 | 초기 온보딩 로그 |
| 겹침 예방   | 겹침 상황 경고 표시율            | ≥ 98%       | 테스트 + 로그    |
| 가시성      | 검색 후 원하는 일정 찾기 시도 수 | ≤ 2회       | UX 측정          |
| 준비성      | 알림 정확도(시각 오차)           | ±1초 이내   | 타이머 테스트    |
| 안정성      | CRUD 실패율(4xx/5xx)             | ≤ 1% (로컬) | CI/로그          |
| 예측 가능성 | 잘못된 시간 형식 비율            | 0%          | 폼 검증          |

### 4. 범위 (Scope)

In (v1): 일정 단일 CRUD, 주/월 달력, 공휴일 표시, 알림, 겹침 경고, 검색.
Deferred: 반복 일정 UI, 일괄 처리 UI, 외부 연동, 계정/권한.
Out: 음력/다국적 휴일, 고급 권한.

### 5. 사용자 시나리오 & Acceptance Criteria

| 시나리오    | 성공 기준                                              | 실패 조건                  |
| ----------- | ------------------------------------------------------ | -------------------------- |
| 일정 추가   | 저장 후 2초 내 리스트/달력 반영 + 스낵바 성공          | 반영 지연>2초, 에러 무표시 |
| 일정 수정   | 변경 필드가 즉시 표시 + 스낵바 수정됨                  | 반영 실패, 에러 미노출     |
| 일정 삭제   | 목록에서 제거 + 스낵바 삭제됨                          | 남아있음, 에러 미노출      |
| 겹침 경고   | 겹치는 모든 일정 명시된 다이얼로그 표시                | 미표시/누락                |
| 검색        | 대상 필드(title/description/location) 포함 일정만 표시 | 결과 누락/오검출           |
| 알림        | 조건 만족 일정 1회 Alert, 중복 없음                    | 중복 2회 이상              |
| 공휴일 표시 | 해당 월 휴일 전부 셀 내 빨간 텍스트                    | 누락                       |

### 6. 데이터 계약 (Event)

```
Event {
  id: string,
  title: string (1~100자),
  date: YYYY-MM-DD,
  startTime: HH:MM (24h),
  endTime: HH:MM (startTime < endTime),
  description: string (0~500자),
  location: string (0~100자),
  category: '업무'|'개인'|'가족'|'기타',
  repeat: { type: 'none'|'daily'|'weekly'|'monthly'|'yearly', interval: number>=0, endDate?: YYYY-MM-DD, id?: string },
  notificationTime: number (분; 허용 집합 참조)
}
```

### 7. API 스펙 (태그: LIVE / READY / FUTURE)

| Endpoint                        | Method | Tag   | 목적                       | 입력                         | 출력                                   |
| ------------------------------- | ------ | ----- | -------------------------- | ---------------------------- | -------------------------------------- |
| /api/events                     | GET    | LIVE  | 일정 목록 조회             | -                            | { events: Event[] }                    |
| /api/events                     | POST   | LIVE  | 일정 생성                  | Event( id 제외 )             | Event                                  |
| /api/events/:id                 | PUT    | LIVE  | 일정 수정                  | Partial<Event>               | 수정 후 Event(향후) / 현재는 기존 객체 |
| /api/events/:id                 | DELETE | LIVE  | 일정 삭제                  | -                            | 204                                    |
| /api/events-list                | POST   | READY | 다건 생성 + repeat.id 공유 | { events: Event[] }          | Event[]                                |
| /api/events-list                | PUT    | READY | 다건 수정                  | { events: Partial<Event>[] } | 기존 events                            |
| /api/events-list                | DELETE | READY | 다건 삭제                  | { eventIds: string[] }       | 204                                    |
| /api/recurring-events/:repeatId | PUT    | READY | 반복 시리즈 수정           | Partial<Event>               | 시리즈 기존 목록                       |
| /api/recurring-events/:repeatId | DELETE | READY | 반복 시리즈 삭제           | -                            | 204                                    |

개선 예정: PUT /api/events/:id 응답을 최종 수정 객체로 통일. 다건 수정은 partial 성공 목록/실패 목록 분리.

### 8. 반복 일정 (FUTURE 상세)

필드: type, interval(≥1), endDate(선택). 월 반복 시 31일 미존재 달 -> 정책: 기본 "건너뛰기"(차후 문서화). 시리즈 수정/삭제 시 단일 vs 전체 선택 UI 필요.

### 9. 알림 정책

체크 주기: 1초. 조건: 0 < (start - now)분 ≤ notificationTime AND 미알림. 중복 방지: notifiedEvents 배열. 허용 오차: ±1초.

### 10. 겹침 정의

동일 date && startA < endB && startB < endA. 겹침 시 다이얼로그: 제목/시간 목록 + 취소/계속 버튼.

### 11. 검색 규칙

필드(title, description, location) 부분 일치(대소문자 무시). 검색어 빈 문자열이면 범위(주/월) 내 모두.

### 12. 달력 렌더링

월: null 채움으로 7열 주 배열. 주: 기준 날짜 포함 주 일~토 배열. 경계(연말/연초/윤년) 테스트로 검증.

### 13. 유효성 규칙

프런트: 필수(title/date/start/end), start<end. 카테고리 미지정 시 '업무'. 서버 현재 404/500만 활용.

### 14. 테스트 매핑

달력: easy.dateUtils.spec.ts / 겹침: easy.eventOverlap.spec.ts / 검색: easy.eventUtils.spec.ts + useSearch / 알림: notificationUtils + useNotifications / 시간검증: timeValidation / CRUD+UI: medium.integration / 훅 동작: useCalendarView/useEventOperations / 미커버: 반복·다건.

### 15. 실행 가능 규칙

1. 커밋 메시지 패턴: `feat|fix|docs|test|chore: ...`
2. 테스트 태그 @critical(optional)
3. lint 통과 필수 (`pnpm run lint`)
4. 커버리지 목표 Lines≥85%, Branches≥75% (미도달 시 CI 경고)
5. docs/PRD.md 변경 시 Change Log 섹션 필수 업데이트.

### 16. 모호성 제거 표

| 금지     | 대체           |
| -------- | -------------- |
| 빠르게   | 45초 이내      |
| 정확하게 | 오차 ±1초 이내 |
| 많다     | ≥ N 명시       |
| 안정적   | 실패율 ≤1%     |
| 적절히   | 구체 규칙 표현 |

### 17. 위험 & 대응

| 위험            | 영향          | 대응                                      |
| --------------- | ------------- | ----------------------------------------- |
| 파일 동시쓰기   | 데이터 손실   | 단일 사용자 가정 / DB 전환 계획           |
| 알림 성능       | CPU 상승      | 일정≥1000 시 5초 주기(성능 정책 Appendix) |
| PUT 응답 불일치 | UI 혼란       | API 개선 티켓                             |
| 하드코딩 휴일   | 유지보수 증가 | 휴일 스키마 외부 JSON(Appendix D)         |
| 반복 정책 미정  | UX 불명확     | v1.3 논의                                 |

### 18. 접근성 TODO

달력 셀 aria-label(날짜+휴일). 겹침 다이얼로그 포커스 관리. 알림 role=status. 대비 검사.

### 19. 성능 개요

필터/알림 O(n). n≥1000 시 체크 주기 증가. 향후 우선순위 큐 도입 검토.

### 20. Roadmap Snapshot

v1.3 반복 일정 UI, v1.4 성능/알림 채널, v1.5 공유/외부 연동.

### 21. 용어 사전

겹침: 시간 교차. 시리즈: repeat.id 공유 묶음. 알림시간: 시작 전 남은 분 기준. 뷰: week/month.

### 22. Open Questions

| 질문                                | 필요성      | 결정 시점      |
| ----------------------------------- | ----------- | -------------- |
| 월 31일 정책(말일 대체 vs 건너뛰기) | 반복 정확성 | v1.3           |
| 다중 알림 채널 우선순위             | 사용자 가치 | v1.4           |
| 사용자 정의 카테고리                | 유연성      | v1.5           |
| 휴일 외부 API 도입                  | 최신성      | 비용/보안 검토 |

### 23. 요약 (TL;DR)

일정 CRUD·겹침·알림·검색·주/월 달력·공휴일 표시를 명확한 규칙과 테스트로 지원. 반복/대량/외부 연동은 다음 단계. 문서는 측정 기준과 계약표로 재구현 가능.

---

## Appendix A. 훅 & 유틸 함수 계약표

| 이름                                            | 입력                     | 출력                                                               | 주요 에러/주의                                 |
| ----------------------------------------------- | ------------------------ | ------------------------------------------------------------------ | ---------------------------------------------- | --------------- |
| useEventForm(initialEvent?)                     | Event(optional)          | {title,setTitle,date,...,editEvent,resetForm}                      | 시간 검증은 getTimeErrorMessage 호출 결과 사용 |
| useEventOperations(editing:boolean,onSave?)     | flags                    | {events,fetchEvents,saveEvent,deleteEvent}                         | 네트워크 실패 시 스낵바 에러                   |
| useCalendarView()                               | -                        | {view,setView,currentDate,setCurrentDate,holidays,navigate}        | navigate는 view에 따라 +7일 또는 ±1개월        |
| useSearch(events,currentDate,view)              | 목록, 기준 날짜, 뷰      | {searchTerm,setSearchTerm,filteredEvents}                          | 대소문자 무시 필터                             |
| useNotifications(events)                        | 일정 배열                | {notifications,notifiedEvents,setNotifications,removeNotification} | 1초 간격 setInterval                           |
| getWeekDates(date)                              | Date                     | Date[7]                                                            | 연말/연초 경계 처리                            |
| getWeeksAtMonth(date)                           | Date                     | number                                                             | null[][]                                       | 첫 주 null 패딩 |
| findOverlappingEvents(newEvent, events)         | Event                    | EventForm, Event[]                                                 | Event[]                                        | 동일 ID 제외    |
| getFilteredEvents(events,term,currentDate,view) | Event[],string,Date,view | Event[]                                                            | 범위+검색 동시 적용                            |
| getUpcomingEvents(events,now,notifiedIds)       | Event[],Date,string[]    | Event[]                                                            | notificationTime 분 내 시작 예정               |
| getTimeErrorMessage(start,end)                  | HH:MM,HH:MM              | {startTimeError,endTimeError}                                      | start>=end 시 동시 에러                        |
| fetchHolidays(date)                             | Date                     | Record<string,string>                                              | 월 매칭된 휴일만 반환                          |

## Appendix B. API 샘플 (현 구현 기준)

1. 일정 생성 요청

```
POST /api/events
{ "title": "팀 회의", "date": "2025-10-30", "startTime": "10:00", "endTime": "11:00", "description": "주간 진행", "location": "회의실 A", "category": "업무", "repeat": {"type":"none","interval":0}, "notificationTime": 10 }
```

응답(예):

```
201
{ "id": "a3f1-...", "title": "팀 회의", ... }
```

2. 일정 수정 요청(향후 바람직한 형태)

```
PUT /api/events/a3f1-...
{ "title": "수정된 팀 회의", "endTime": "11:30" }
```

현재 응답(기존 객체 반환) → 개선 후:

```
200
{ "id": "a3f1-...", "title": "수정된 팀 회의", "endTime": "11:30", ... }
```

3. 겹침 발생 저장 흐름
   신규 일정이 기존 10:00~11:00와 10:30~11:30 겹침 → 다이얼로그:

```
일정 겹침 경고
기존 일정 (2025-10-30 10:00-11:00)
...
```

## Appendix C. 허용 값 정책 & 에러 포맷(제안)

허용 집합:

- category: ['업무','개인','가족','기타'] (향후 사용자 정의 확장 가능)
- notificationTime: [1,10,60,120,1440] (0은 “알림 없음” 옵션 향후 추가 가능)
- repeat.type: ['none','daily','weekly','monthly','yearly']
- repeat.interval: 정수 ≥ 1 (type 'none'일 때 0 허용)

에러 포맷(향후 서버 구현 제안):

```
{ "error": { "code": "VALIDATION_ERROR", "field": "startTime", "message": "startTime은 endTime보다 빨라야 합니다." } }
```

다건 오류 예:

```
{ "error": { "code": "BATCH_PARTIAL_FAIL", "failedIds": ["id1","id2"], "message": "일부 일정 수정 실패" } }
```

## Appendix D. 휴일 데이터 스키마

현재 상수: `Record<YYYY-MM-DD, 휴일명>`.
확장 정책:

1. 파일 분리: `holidays-YYYY.json`
2. 포맷:

```
{
  "year": 2025,
  "items": [ { "date": "2025-10-03", "name": "개천절" }, ... ]
}
```

3. 로딩 규칙: 조회 월이 바뀔 때 해당 연도 파일 캐싱.
4. 다국어 확장: `{ "date": ..., "names": { "ko": "개천절", "en": "National Foundation Day" } }`.

## Appendix E. 성능 임계치 & Degradation 정책

| 항목      | 임계치              | 조치                                     |
| --------- | ------------------- | ---------------------------------------- |
| 알림 체크 | 일정 수 < 1000      | 1초 주기 유지                            |
| 알림 체크 | 일정 수 ≥ 1000      | 5초 주기로 자동 증가                     |
| 필터 성능 | n ≥ 5000            | 초기 로딩 시 이벤트를 날짜별 Map 캐싱    |
| 메모리    | notifications ≥ 100 | 가장 오래된 알림부터 자동 제거(선입선출) |

향후: 우선순위 큐(이벤트 시작 시간 기준)로 알림 후보만 관리하여 O(log n) 스케줄.

---

### 문서 유지 규칙

1. 모든 구조/정책 변경 시 Change Log 버전 번호 증가.
2. Appendix 변경 시 해당 섹션에 날짜 주석 추가 권장.
3. 명세 미충족 모호 표현 발견 시 금지/대체 표 업데이트.

### 마지막 확인

이 문서 단독으로 기능/테스트/설계/확장/리팩터 방향 추론 가능하도록 계약·정책·예시·위험·미래 항목을 제공합니다.
