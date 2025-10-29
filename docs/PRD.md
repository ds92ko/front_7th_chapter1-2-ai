# 📅 프로젝트: AI 에이전트 기반 캘린더 앱 (Project: AI Agent-based Calendar App)

## 1. 프로젝트 개요 (Project Overview)

### 1.1. 목표

이 프로젝트는 사용자가 개인 및 업무 일정을 효과적으로 관리할 수 있도록 돕는 웹 기반 캘린더 애플리케이션입니다. 사용자는 이벤트를 생성, 수정, 삭제하고 월별 또는 주별로 일정을 시각적으로 확인할 수 있습니다.

### 1.2. 주요 기능 요약

- **일정 관리:** 제목, 날짜, 시간, 설명 등을 포함한 일정 생성, 수정, 삭제 기능
- **캘린더 뷰:** 월별(Month View) 및 주별(Week View) 일정 보기 모드 제공
- **일정 검색:** 키워드를 통해 특정 일정을 빠르게 검색
- **알림:** 설정된 시간에 따라 일정 알림을 표시
- **공휴일 표시:** 월별 뷰에 대한민국 공휴일 자동 표시
- **중복 일정 경고:** 새로운 일정 추가 시 기존 일정과 시간이 겹치면 경고 표시

---

## 2. 기술 스택 및 주요 라이브러리 (Tech Stack & Key Libraries)

- **언어 (Language):** TypeScript
- **프레임워크 (Framework):** React (v19)
- **빌드/개발 도구 (Build/Dev Tool):** Vite
- **패키지 매니저 (Package Manager):** pnpm
- **UI 라이브러리 (UI Library):** Material-UI (MUI) v7.2
- **상태 관리 (State Management):** React Hooks (`useState`, `useContext`) 기반의 커스텀 훅. **전역 상태 관리 라이브러리 대신, 기능적으로 관련된 상태는 커스텀 훅으로 캡슐화하고, 여러 컴포넌트 간의 상태 공유가 필요할 경우 React Context를 사용하는 것을 지향합니다.**
- **테스팅 (Testing):**
  - **Runner/Assertion:** Vitest
  - **Component Testing:** React Testing Library
  - **DOM Simulation:** JSDOM
  - **API Mocking:** Mock Service Worker (MSW)
- **라우팅 (Routing):** 단일 페이지 애플리케이션으로, 별도의 라우팅 라이브러리 없음
- **서버 (Server):** Express (API 모킹 및 개발용)
- **코드 스타일 (Code Style):** ESLint, Prettier

---

## 3. 아키텍처 및 디렉토리 구조 (Architecture & Directory Structure)

이 프로젝트는 기능별로 코드를 분리하는 모듈식 아키텍처를 따릅니다.

- **`public/`**: 정적 에셋 (e.g., `vite.svg`)
- **`src/`**: 애플리케이션의 주요 소스 코드
  - **`apis/`**: 외부 API 호출 관련 함수 (e.g., `fetchHolidays.ts`)
  - **`hooks/`**: 비즈니스 로직을 포함하는 재사용 가능한 커스텀 훅
    - `useCalendarView.ts`: 캘린더 뷰(월/주) 상태 및 네비게이션 관리
    - `useEventForm.ts`: 일정 추가/수정 폼의 상태 및 유효성 검사 관리
    - `useEventOperations.ts`: 이벤트 데이터 CRUD(생성, 읽기, 업데이트, 삭제) 로직 처리
    - `useNotifications.ts`: 일정 알림 관련 로직 관리
    - `useSearch.ts`: 일정 검색 기능 관리
  - **`utils/`**: 특정 도메인에 종속되지 않는 순수 유틸리티 함수
    - `dateUtils.ts`: 날짜/시간 포맷팅 및 계산 관련 함수
    - `eventOverlap.ts`: 일정 중복 여부 계산 함수
    - `timeValidation.ts`: 시간 유효성 검사 함수
  - **`types.ts`**: 프로젝트 전반에서 사용되는 TypeScript 타입 정의
  - **`main.tsx`**: 애플리케이션 진입점
  - **`App.tsx`**: 메인 애플리케이션 컴포넌트. UI 레이아웃과 훅들을 조합하여 전체 앱을 구성.
- **`src/__mocks__/`**: MSW를 사용한 API 모킹 관련 파일
  - `handlers.ts`: API 요청을 가로채는 핸들러 정의
  - `response/`: 모킹에 사용될 JSON 데이터
- **`src/__tests__/`**: 테스트 코드
  - `unit/`: 단일 함수나 모듈을 테스트하는 단위 테스트
  - `hooks/`: 커스텀 훅에 대한 테스트
  - `medium.integration.spec.tsx`: 여러 컴포넌트/훅이 통합된 기능 테스트

---

## 4. 데이터 모델 및 API 명세 (Data Models & API Specs)

### 4.1. 데이터 모델 (`src/types.ts`)

- **`Event`**: 일정의 기본 데이터 구조
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
    notificationTime: number; // 분 단위
  }
  ```
- **`RepeatInfo`**: 반복 일정 정보
  ```typescript
  interface RepeatInfo {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  }
  ```

### 4.2. API 명세 (MSW Mocking 기준 - `src/__mocks__/handlers.ts`)

- **`GET /api/events`**: 모든 일정 목록을 조회합니다.
  - **Response Body:** `{ events: Event[] }`
- **`POST /api/events`**: 새로운 일정을 생성합니다.
  - **Request Body:** `EventForm` (id가 없는 Event)
  - **Response Body:** `Event` (id가 부여된)
- **`PUT /api/events/:id`**: 특정 ID의 일정을 수정합니다.
  - **Request Body:** `Partial<EventForm>`
  - **Response Body:** `Event` (수정된)
- **`DELETE /api/events/:id`**: 특정 ID의 일정을 삭제합니다.
  - **Response:** `204 No Content`

---

## 5. 코딩 컨벤션 및 스타일 가이드 (Coding Conventions & Style Guide)

- **컴포넌트:** React 함수형 컴포넌트(Functional Component)와 Hooks를 사용합니다.
- **네이밍:**
  - 컴포넌트: `PascalCase` (e.g., `MonthView`)
  - 커스텀 훅: `use` 접두사를 사용한 `camelCase` (e.g., `useEventForm`)
  - 변수/함수: `camelCase`
- **타이핑:** 모든 곳에 TypeScript를 사용하여 타입 안정성을 확보합니다. `any` 타입 사용을 지양합니다.
- **스타일링:** `@mui/material` 컴포넌트와 `sx` prop을 사용한 스타일링을 기본으로 합니다.
- **상수 선언:** 컴포넌트 내에서만 사용되는 정적 배열/상수는 렌더링과 무관하게 컴포넌트 함수 외부에 `const`로 선언하여 불필요한 재생성을 방지합니다. (e.g., `const categories = [...]` in `App.tsx`)
- **코드 포맷:** `Prettier`와 `ESLint` 규칙을 따릅니다. 커밋 전 `lint` 스크립트를 실행하여 일관성을 유지합니다.

---

## 6. 주요 실행 명령어 (Key Commands - `package.json`)

- **`pnpm dev`**: 개발 서버(Vite)와 API 모의 서버(Express)를 동시에 실행합니다. (주 개발 명령어)
- **`pnpm test`**: Vitest를 사용하여 모든 테스트를 실행합니다.
- **`pnpm test:ui`**: Vitest UI를 통해 시각적으로 테스트를 확인합니다.
- **`pnpm test:coverage`**: 테스트 커버리지를 측정합니다.
- **`pnpm lint`**: ESLint와 TypeScript 컴파일러를 통해 코드 품질을 검사합니다.
- **`pnpm build`**: 프로덕션용으로 프로젝트를 빌드합니다.

---

## 7. 주요 코드 예시 (Key Code Snippets)

### 7.1. 커스텀 훅 (`/src/hooks/useSearch.ts` 예시)

```typescript
import { useState, useMemo } from 'react';
import { Event } from '../types';
import { filterEvents } from '../utils/eventUtils'; // (가상)

// 훅은 상태(state)와 그 상태를 변경하는 함수, 그리고 파생된 데이터(memoized)를 반환합니다.
export function useSearch(events: Event[]) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = useMemo(() => {
    if (!searchTerm) {
      return events;
    }
    // 실제 로직은 다를 수 있으나, 검색어로 이벤트를 필터링하는 패턴을 보여줍니다.
    return events.filter((event) => event.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, events]);

  return { searchTerm, setSearchTerm, filteredEvents };
}
```

### 7.2. 단위 테스트 (`/src/__tests__/unit/easy.dateUtils.spec.ts` 예시)

```typescript
import { describe, it, expect } from 'vitest';
import { formatMonth } from '../../utils/dateUtils';

// `describe`로 테스트할 대상을 그룹화합니다.
describe('dateUtils', () => {
  // 중첩 `describe`로 특정 함수를 명시합니다.
  describe('formatMonth', () => {
    // `it`으로 테스트 케이스를 설명합니다.
    it('should format a Date object to "YYYY년 M월" string', () => {
      // Given: 테스트할 입력값
      const date = new Date('2025-10-29');

      // When: 함수 실행
      const result = formatMonth(date);

      // Then: 기대하는 결과
      expect(result).toBe('2025년 10월');
    });
  });
});
```

### 7.3. 컴포넌트 스타일링 (`/src/App.tsx` 일부 예시)

```typescript
import { FormControl, FormLabel, TextField, Box } from '@mui/material';

// MUI 컴포넌트와 `sx` prop을 사용하여 스타일을 적용합니다.
// `sx` prop 내에서는 theme 접근이 가능하며, 반응형 디자인을 위한 배열 문법도 사용할 수 있습니다.
function EventForm() {
  // ... component logic
  return (
    <Box sx={{ width: '100%', p: { xs: 2, md: 4 } }}>
      <FormControl fullWidth margin="normal">
        <FormLabel htmlFor="title">제목</FormLabel>
        <TextField
          id="title"
          size="small"
          // ... other props
        />
      </FormControl>
    </Box>
  );
}
```
