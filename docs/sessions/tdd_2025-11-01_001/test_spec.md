# 🧪 Artemis: 테스트 설계 명세 (Test Specification)

> **세션 ID**: tdd_2025-11-01_001  
> **작성일**: 2025-11-01  
> **작성자**: Artemis  
> **단계**: 2단계 - 테스트 설계

---

## 1. 📋 테스트 개요

### 1.1 테스트 목적

캘린더 뷰(주별/월별)에서 반복 일정에 Repeat 아이콘이 정확히 표시되는지 검증합니다.

### 1.2 테스트 범위

- **단위 테스트**: 없음 (UI 컴포넌트 테스트만 수행)
- **통합 테스트**: 캘린더 뷰에서 아이콘 표시 검증

---

## 2. 🎯 통합 테스트 설계

### 2.1 주별 뷰 - 반복 일정 아이콘 표시

**테스트 케이스**: "주별 뷰에서 반복 일정에 Repeat 아이콘이 표시된다"

**Given (준비)**:

- 반복 일정 생성
  - title: "주간 회의"
  - date: "2025-10-02"
  - repeat.type: "weekly"
  - repeat.interval: 1

**When (실행)**:

- 주별 뷰로 전환
- 해당 일자의 일정 확인

**Then (검증)**:

- Repeat 아이콘이 표시됨
- 일정 제목 "주간 회의" 표시됨

---

### 2.2 월별 뷰 - 반복 일정 아이콘 표시

**테스트 케이스**: "월별 뷰에서 반복 일정에 Repeat 아이콘이 표시된다"

**Given (준비)**:

- 반복 일정 생성
  - title: "월간 보고"
  - date: "2025-10-15"
  - repeat.type: "monthly"
  - repeat.interval: 1

**When (실행)**:

- 월별 뷰에서 해당 일자 확인

**Then (검증)**:

- Repeat 아이콘이 표시됨
- 일정 제목 "월간 보고" 표시됨

---

### 2.3 일반 일정 - Repeat 아이콘 미표시

**테스트 케이스**: "일반 일정(repeat.type === 'none')에는 Repeat 아이콘이 표시되지 않는다"

**Given (준비)**:

- 일반 일정 생성
  - title: "일반 회의"
  - date: "2025-10-02"
  - repeat.type: "none"

**When (실행)**:

- 주별 뷰로 전환
- 해당 일자의 일정 확인

**Then (검증)**:

- Repeat 아이콘이 표시되지 않음
- 일정 제목만 표시됨

---

### 2.4 알림 + 반복 일정 - 두 아이콘 동시 표시

**테스트 케이스**: "알림 시간이 도래한 반복 일정은 두 아이콘이 모두 표시된다"

**Given (준비)**:

- 반복 일정 생성 (알림 설정)
  - title: "중요 회의"
  - date: "2025-10-01 09:00"
  - repeat.type: "daily"
  - notificationTime: 10 (10분 전)
- 시스템 시간을 08:51로 설정 (알림 시간 도래)

**When (실행)**:

- 월별 뷰에서 해당 일자 확인

**Then (검증)**:

- Notifications 아이콘 표시됨
- Repeat 아이콘 표시됨
- 두 아이콘이 나란히 표시됨

---

## 3. 📝 테스트 시나리오 상세

### 3.1 시나리오 1: 주별 뷰 - 매주 반복 일정

```
1. 사용자가 일정 추가
   - 제목: "주간 회의"
   - 날짜: 2025-10-02
   - 반복: 매주

2. 주별 뷰로 전환

3. 검증:
   - week-view에서 "주간 회의" 찾기
   - Repeat 아이콘 존재 확인
   - aria-label 또는 data-testid로 아이콘 식별
```

### 3.2 시나리오 2: 월별 뷰 - 매월 반복 일정

```
1. 사용자가 일정 추가
   - 제목: "월간 보고"
   - 날짜: 2025-10-15
   - 반복: 매월

2. 월별 뷰 확인 (기본 뷰)

3. 검증:
   - month-view에서 "월간 보고" 찾기
   - Repeat 아이콘 존재 확인
```

### 3.3 시나리오 3: 일반 일정 - 아이콘 없음

```
1. 사용자가 일반 일정 추가
   - 제목: "일반 회의"
   - 날짜: 2025-10-02
   - 반복: 없음

2. 주별 뷰로 전환

3. 검증:
   - "일반 회의" 텍스트 존재
   - Repeat 아이콘 없음
```

### 3.4 시나리오 4: 복합 케이스 - 알림 + 반복

```
1. 반복 일정 + 알림 추가
   - 제목: "중요 회의"
   - 날짜: 2025-10-01 09:00
   - 반복: 매일
   - 알림: 10분 전

2. 시스템 시간 설정: 2025-10-01 08:51

3. 월별 뷰 확인

4. 검증:
   - Notifications 아이콘 (빨간색)
   - Repeat 아이콘 (파란색)
   - 두 아이콘 모두 표시
```

---

## 4. 🔍 테스트 대상 식별

### 4.1 DOM 구조

**주별 뷰**:

```
<Stack data-testid="week-view">
  <TableCell>
    <Box> <!-- 일정 박스 -->
      <Stack direction="row" spacing={1}>
        [Notifications 아이콘 (조건부)]
        [Repeat 아이콘 (조건부)] ← 새로 추가
        <Typography>{event.title}</Typography>
      </Stack>
    </Box>
  </TableCell>
</Stack>
```

**월별 뷰**:

```
<Stack data-testid="month-view">
  <TableCell>
    <Box> <!-- 일정 박스 -->
      <Stack direction="row" spacing={1}>
        [Notifications 아이콘 (조건부)]
        [Repeat 아이콘 (조건부)] ← 새로 추가
        <Typography>{event.title}</Typography>
      </Stack>
    </Box>
  </TableCell>
</Stack>
```

### 4.2 아이콘 식별 방법

**RTL 쿼리 우선순위**:

1. `getByTestId('RepeatIcon')` (추천 - data-testid 추가 시)
2. `getByRole()` + aria-label
3. SVG 요소 직접 검색
4. className 기반 검색

**예시**:

```typescript
// Material-UI Repeat 아이콘 찾기
const repeatIcon = within(eventBox).queryByTestId('RepeatIcon');
expect(repeatIcon).toBeInTheDocument();

// 또는 SVG 기반
const svg = within(eventBox).container.querySelector('svg[data-testid="RepeatIcon"]');
```

---

## 5. 📊 테스트 커버리지

### 5.1 기능 커버리지

| 기능                            | 테스트 여부 |
| ------------------------------- | ----------- |
| 주별 뷰 - 반복 일정 아이콘 표시 | ✅          |
| 월별 뷰 - 반복 일정 아이콘 표시 | ✅          |
| 일반 일정 - 아이콘 미표시       | ✅          |
| 알림 + 반복 - 두 아이콘 표시    | ✅          |

### 5.2 반복 유형별 커버리지

| 반복 유형 | 테스트 여부             |
| --------- | ----------------------- |
| daily     | ✅                      |
| weekly    | ✅                      |
| monthly   | ✅                      |
| yearly    | ⚠️ (weekly와 동일 로직) |
| none      | ✅                      |

---

## 6. 🎯 예상 결과

### 6.1 테스트 통과 조건

**Red 단계 (현재)**:

- 모든 테스트 실패 예상
- Repeat 아이콘이 아직 구현되지 않음

**Green 단계 (Hermes 후)**:

- 모든 테스트 통과
- 4개 테스트 케이스 성공

### 6.2 예상 테스트 결과

```
✗ 주별 뷰에서 반복 일정에 Repeat 아이콘이 표시된다
✗ 월별 뷰에서 반복 일정에 Repeat 아이콘이 표시된다
✗ 일반 일정에는 Repeat 아이콘이 표시되지 않는다
✗ 알림 + 반복 일정은 두 아이콘이 모두 표시된다

→ Hermes 구현 후 모두 ✓로 변경 예상
```

---

## 7. 📚 참조

### 7.1 관련 파일

- `feature_spec.md`: Athena의 기능 명세
- `src/App.tsx`: 테스트 대상 컴포넌트
- `src/__tests__/medium.integration.spec.tsx`: 기존 통합 테스트 참조

### 7.2 테스트 라이브러리

- **Vitest**: 테스트 러너
- **React Testing Library**: DOM 쿼리 및 assertion
- **@testing-library/user-event**: 사용자 상호작용 시뮬레이션

---

**테스트 설계 완료 시각**: 2025-11-01 05:36:00  
**다음 단계**: Poseidon (테스트 코드 작성 - Red)
