# ⚡ Hermes: 기능 구현 코드 (Green)

> **세션 ID**: tdd_2025-11-01_001  
> **작성일**: 2025-11-01  
> **작성자**: Hermes  
> **단계**: 4단계 - 코드 작성 (TDD Green)

---

## 1. 📋 구현 개요

### 1.1 구현 목표

캘린더 뷰(주별/월별)에서 반복 일정에 Repeat 아이콘을 표시하는 기능을 구현합니다.

### 1.2 구현 범위

**✅ 구현 완료:**

- import 추가 (1줄)
- 주별 뷰 아이콘 추가 (1줄)
- 월별 뷰 아이콘 추가 (1줄)

**총 수정 라인**: 3줄

---

## 2. 🎯 구현 코드 상세

### 2.1 import 추가

**파일**: `src/App.tsx` (1줄)

```typescript
import {
  Notifications,
  ChevronLeft,
  ChevronRight,
  Delete,
  Edit,
  Close,
  Repeat,
} from '@mui/icons-material';
```

### 2.2 주별 뷰 - Repeat 아이콘 추가

**파일**: `src/App.tsx` (약 203줄)

```typescript
<Stack direction="row" spacing={1} alignItems="center">
  {isNotified && <Notifications fontSize="small" />}
  {event.repeat.type !== 'none' && <Repeat fontSize="small" color="primary" data-testid="RepeatIcon" />}
  <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
    {event.title}
  </Typography>
</Stack>
```

### 2.3 월별 뷰 - Repeat 아이콘 추가

**파일**: `src/App.tsx` (약 291줄)

```typescript
<Stack direction="row" spacing={1} alignItems="center">
  {isNotified && <Notifications fontSize="small" />}
  {event.repeat.type !== 'none' && <Repeat fontSize="small" color="primary" data-testid="RepeatIcon" />}
  <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
    {event.title}
  </Typography>
</Stack>
```

---

## 3. 📊 테스트 결과

### 3.1 전체 테스트

```
✅ Test Files: 12 passed (12)
✅ Tests: 147 passed (147)
⏱️ Duration: 14.99s
```

### 3.2 검증 완료

- [x] 기존 테스트 모두 통과
- [x] 반복 일정에 아이콘 표시
- [x] 일반 일정에는 아이콘 미표시
- [x] 주별/월별 뷰 모두 적용
- [x] 알림 아이콘과 함께 표시

---

## 4. 🔍 구현 세부사항

### 4.1 조건부 렌더링

```typescript
{event.repeat.type !== 'none' && <Repeat fontSize="small" color="primary" data-testid="RepeatIcon" />}
```

- **조건**: `event.repeat.type !== 'none'`
- **아이콘**: Material-UI `Repeat`
- **크기**: `small` (알림 아이콘과 동일)
- **색상**: `primary` (파란색 계열)
- **testid**: `RepeatIcon` (테스트 식별용)

### 4.2 기존 코드 활용

- 기존 알림 아이콘 로직과 동일한 패턴 사용
- 조건부 렌더링 추가만으로 구현
- 기존 레이아웃 구조 유지

---

## 5. ✅ 체크리스트

- [x] feature_spec.md 기반 구현
- [x] 3줄만 수정 (최소한의 변경)
- [x] 기존 코드 활용
- [x] 의존성 추가 없음
- [x] 모든 테스트 통과
- [x] 주별/월별 뷰 모두 적용
- [x] Linter 오류 없음

---

**구현 완료 시각**: 2025-11-01 05:42:00  
**다음 단계**: Apollo (리팩토링)
