# 🎯 Athena: 기능 명세 (Feature Specification)

> **세션 ID**: tdd_2025-11-01_001  
> **작성일**: 2025-11-01  
> **작성자**: Athena  
> **단계**: 1단계 - 기능 설계

---

## 1. 📋 기능 개요

### 1.1 기능 요약

캘린더 뷰(주별/월별)에서 반복 일정을 시각적으로 구분하여 표시하는 기능을 추가합니다. 반복 일정(repeat.type !== 'none')에는 Repeat 아이콘을 표시하여 일반 일정과 구별할 수 있도록 합니다.

### 1.2 작업 범위

**✅ 작업 대상:**

- `src/App.tsx`의 캘린더 뷰 렌더링 로직 (주별/월별)

**🚫 작업 제외:**

- API 수정 (기존 API 활용)
- 새로운 컴포넌트 생성 (기존 구조 활용)
- 일정 목록 뷰 (이미 repeat 정보 표시 중)

---

## 2. 🔍 프로젝트 분석

### 2.1 현재 시스템 구조

#### 캘린더 뷰 렌더링 로직

**위치**: `src/App.tsx`

1. **주별 뷰** (`renderWeekView`):
   - 일정 박스 렌더링 위치: 184-212줄
   - 현재 구조: `<Stack direction="row">` + 알림 아이콘 + 제목
2. **월별 뷰** (`renderMonthView`):
   - 일정 박스 렌더링 위치: 271-300줄
   - 현재 구조: `<Stack direction="row">` + 알림 아이콘 + 제목

#### 사용 중인 아이콘

```typescript
import { Notifications, ChevronLeft, ChevronRight, Delete, Edit, Close } from '@mui/icons-material';
```

- `Notifications`: 알림 시간 도래 시 표시
- 색상: `error` (빨간색)
- 크기: `small` / `fontSize="small"`

### 2.2 기존 데이터 구조

```typescript
interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number;
}

interface RepeatInfo {
  type: RepeatType; // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number;
  endDate?: string;
  id?: string;
}
```

---

## 3. 🎨 기능 명세

### 3.1 Repeat 아이콘 표시 조건

**조건**: `event.repeat.type !== 'none'`

**아이콘**: Material-UI의 `Repeat` 아이콘 사용

- import: `import { Repeat } from '@mui/icons-material';`
- 크기: `fontSize="small"` (알림 아이콘과 동일)
- 색상: `primary` (기본 색상, 테마에 따라 파란색 계열)

### 3.2 아이콘 표시 위치

기존 알림 아이콘과 동일한 방식으로 표시:

```typescript
<Stack direction="row" spacing={1} alignItems="center">
  {isNotified && <Notifications fontSize="small" />}
  {event.repeat.type !== 'none' && <Repeat fontSize="small" color="primary" />}
  <Typography variant="caption" noWrap>
    {event.title}
  </Typography>
</Stack>
```

### 3.3 적용 범위

1. **주별 뷰** (`renderWeekView` 함수)
   - 파일: `src/App.tsx`
   - 위치: 약 201-210줄
2. **월별 뷰** (`renderMonthView` 함수)
   - 파일: `src/App.tsx`
   - 위치: 약 288-297줄

---

## 4. 📝 상세 구현 명세

### 4.1 주별 뷰 수정

**수정 전:**

```typescript
<Stack direction="row" spacing={1} alignItems="center">
  {isNotified && <Notifications fontSize="small" />}
  <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
    {event.title}
  </Typography>
</Stack>
```

**수정 후:**

```typescript
<Stack direction="row" spacing={1} alignItems="center">
  {isNotified && <Notifications fontSize="small" />}
  {event.repeat.type !== 'none' && <Repeat fontSize="small" color="primary" />}
  <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
    {event.title}
  </Typography>
</Stack>
```

### 4.2 월별 뷰 수정

**수정 전:**

```typescript
<Stack direction="row" spacing={1} alignItems="center">
  {isNotified && <Notifications fontSize="small" />}
  <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
    {event.title}
  </Typography>
</Stack>
```

**수정 후:**

```typescript
<Stack direction="row" spacing={1} alignItems="center">
  {isNotified && <Notifications fontSize="small" />}
  {event.repeat.type !== 'none' && <Repeat fontSize="small" color="primary" />}
  <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
    {event.title}
  </Typography>
</Stack>
```

### 4.3 import 추가

`src/App.tsx` 상단에 `Repeat` 아이콘 추가:

**수정 전:**

```typescript
import { Notifications, ChevronLeft, ChevronRight, Delete, Edit, Close } from '@mui/icons-material';
```

**수정 후:**

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

---

## 5. 🧪 테스트 시나리오

### 5.1 단위 테스트

**대상**: 아이콘 표시 조건 검증

1. **일반 일정 (repeat.type === 'none')**
   - Repeat 아이콘이 표시되지 않아야 함
2. **매일 반복 일정 (repeat.type === 'daily')**
   - Repeat 아이콘이 표시되어야 함
3. **매주 반복 일정 (repeat.type === 'weekly')**
   - Repeat 아이콘이 표시되어야 함
4. **매월 반복 일정 (repeat.type === 'monthly')**
   - Repeat 아이콘이 표시되어야 함
5. **매년 반복 일정 (repeat.type === 'yearly')**
   - Repeat 아이콘이 표시되어야 함

### 5.2 통합 테스트

**대상**: 캘린더 뷰에서 아이콘 표시 검증

1. **주별 뷰에서 반복 일정 표시**
   - 반복 일정 생성 후 주별 뷰에서 Repeat 아이콘 확인
2. **월별 뷰에서 반복 일정 표시**
   - 반복 일정 생성 후 월별 뷰에서 Repeat 아이콘 확인
3. **알림 아이콘과 반복 아이콘 동시 표시**
   - 알림 시간이 도래한 반복 일정의 경우 두 아이콘 모두 표시

4. **일정 수정 후 아이콘 업데이트**
   - 일반 일정을 반복 일정으로 수정 시 아이콘 표시
   - 반복 일정을 일반 일정으로 수정 시 아이콘 제거

---

## 6. 🚀 예상 결과

### 6.1 시각적 효과

**일반 일정:**

```
[🔔] 회의
```

**반복 일정:**

```
[🔁] 주간 회의
```

**알림 + 반복 일정:**

```
[🔔][🔁] 주간 회의
```

### 6.2 사용자 경험 개선

1. **시각적 구분**: 반복 일정을 한눈에 식별 가능
2. **일관성**: 알림 아이콘과 동일한 방식으로 표시되어 직관적
3. **정보 전달**: 아이콘만으로 일정의 특성 파악 가능

---

## 7. 📊 영향 분석

### 7.1 수정 파일

| 파일          | 수정 내용                 | 영향도 |
| ------------- | ------------------------- | ------ |
| `src/App.tsx` | import 추가 (1줄)         | 낮음   |
| `src/App.tsx` | 주별 뷰 아이콘 추가 (1줄) | 낮음   |
| `src/App.tsx` | 월별 뷰 아이콘 추가 (1줄) | 낮음   |

**총 수정 라인**: 3줄

### 7.2 의존성

**새로운 의존성 추가**: 없음 ✅

- Material-UI는 이미 프로젝트에 설치되어 있음
- `Repeat` 아이콘은 `@mui/icons-material` 패키지에 포함

### 7.3 기존 기능에 미치는 영향

**영향 없음** ✅

- 기존 렌더링 로직 변경 없음
- 조건부 렌더링 추가로 기존 동작 유지
- 성능 영향 미미 (조건문 1개 추가)

---

## 8. ✅ 체크리스트

- [x] 프로젝트 구조 분석 완료
- [x] 작업 범위 명확히 정의
- [x] 기존 코드 파악 (캘린더 뷰 렌더링)
- [x] 의존성 최소화 확인 (새 라이브러리 없음)
- [x] 구체적인 수정 위치 명시
- [x] 테스트 시나리오 정의
- [x] 예상 결과 작성
- [x] 영향 분석 완료

---

## 9. 📚 참조

### 9.1 관련 파일

- `src/App.tsx`: 캘린더 뷰 렌더링 로직
- `src/types.ts`: Event, RepeatInfo 타입 정의

### 9.2 Material-UI 문서

- [Repeat Icon](https://mui.com/material-ui/material-icons/?query=repeat)
- [Stack Component](https://mui.com/material-ui/react-stack/)

---

**명세 작성 완료 시각**: 2025-11-01 05:35:00  
**다음 단계**: Artemis (테스트 설계)
