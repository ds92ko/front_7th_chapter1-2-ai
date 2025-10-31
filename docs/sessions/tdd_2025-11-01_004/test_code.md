# 테스트 코드: 반복 일정 삭제 (단일/전체 선택)

**작성자**: Poseidon (테스트 코드 작성자)  
**작성일**: 2025-11-01  
**Session ID**: tdd_2025-11-01_004  
**참조 문서**: `test_spec.md`

---

## 1. 테스트 파일

### 1.1 파일 경로

```
src/__tests__/medium.repeatEventDelete.spec.tsx
```

### 1.2 테스트 구조

- **TC-001**: 반복 일정 삭제 시 다이얼로그 표시
- **TC-002**: "예" 선택 시 단일 삭제
- **TC-003**: "아니오" 선택 시 전체 삭제
- **TC-004**: 단일 일정 삭제 시 다이얼로그 미표시
- **TC-005**: 다이얼로그 취소
- **TC-006**: 다이얼로그 연속 작동
- **TC-007**: API 실패 시 에러 처리

---

## 2. 테스트 실행 결과 (Red 단계)

### 2.1 예상 결과

모든 테스트가 실패해야 함 (기능이 아직 구현되지 않음):

```
❌ TC-001: 반복 일정 삭제 시 선택 다이얼로그가 표시되어야 한다
❌ TC-002: "예"를 선택하면 해당 일정만 삭제되어야 한다
❌ TC-003: "아니오"를 선택하면 같은 시리즈의 모든 일정이 삭제되어야 한다
❌ TC-004: 단일 일정 삭제 시 다이얼로그가 표시되지 않아야 한다
❌ TC-005: 다이얼로그를 취소하면 삭제가 취소되어야 한다
❌ TC-006: 다이얼로그를 여러 번 열고 닫아도 정상 작동해야 한다
❌ TC-007: 삭제 API 호출이 실패할 때 에러가 올바르게 처리되어야 한다
```

---

## 3. 주요 테스트 코드

### 3.1 Setup

```typescript
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};
```

### 3.2 TC-001: 다이얼로그 표시

```typescript
it('반복 일정 삭제 시 선택 다이얼로그가 표시되어야 한다', async () => {
  // Mock 반복 일정 생성
  const mockRecurringEvents: Event[] = [/* ... */];

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockRecurringEvents });
    })
  );

  const { user } = setup(<App />);

  // 반복 일정 삭제 버튼 클릭
  const deleteButtons = await screen.findAllByLabelText('Delete event');
  await user.click(deleteButtons[0]);

  // 다이얼로그 표시 확인
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText('반복 일정 삭제')).toBeInTheDocument();
  expect(within(dialog).getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
  expect(within(dialog).getByRole('button', { name: '예' })).toBeInTheDocument();
  expect(within(dialog).getByRole('button', { name: '아니오' })).toBeInTheDocument();
});
```

### 3.3 TC-002: 단일 삭제

```typescript
it('"예"를 선택하면 해당 일정만 삭제되어야 한다', async () => {
  let deletedEventId: string | null = null;

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockRecurringEvents });
    }),
    http.delete('/api/events/:id', ({ params }) => {
      deletedEventId = params.id as string;
      return new HttpResponse(null, { status: 204 });
    })
  );

  const { user } = setup(<App />);

  // 첫 번째 반복 일정 삭제 버튼 클릭
  const deleteButtons = await screen.findAllByLabelText('Delete event');
  await user.click(deleteButtons[0]);

  // 다이얼로그에서 "예" 클릭
  const dialog = await screen.findByRole('dialog');
  const yesButton = within(dialog).getByRole('button', { name: '예' });
  await user.click(yesButton);

  // API 호출 확인
  await waitFor(() => {
    expect(deletedEventId).toBe('recurring-1');
  });

  // 성공 메시지 확인
  expect(await screen.findByText('일정이 삭제되었습니다.')).toBeInTheDocument();
});
```

### 3.4 TC-003: 전체 삭제

```typescript
it('"아니오"를 선택하면 같은 시리즈의 모든 일정이 삭제되어야 한다', async () => {
  let deletedRepeatId: string | null = null;

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: mockRecurringEvents });
    }),
    http.delete('/api/recurring-events/:repeatId', ({ params }) => {
      deletedRepeatId = params.repeatId as string;
      return new HttpResponse(null, { status: 204 });
    })
  );

  const { user } = setup(<App />);

  // 두 번째 반복 일정 삭제 버튼 클릭
  const deleteButtons = await screen.findAllByLabelText('Delete event');
  await user.click(deleteButtons[1]);

  // 다이얼로그에서 "아니오" 클릭
  const dialog = await screen.findByRole('dialog');
  const noButton = within(dialog).getByRole('button', { name: '아니오' });
  await user.click(noButton);

  // API 호출 확인
  await waitFor(() => {
    expect(deletedRepeatId).toBe('repeat-456');
  });

  // 성공 메시지 확인
  expect(await screen.findByText('반복 일정이 삭제되었습니다.')).toBeInTheDocument();
});
```

---

## 4. 체크리스트 (Poseidon)

- [x] 모든 테스트 케이스가 `test_spec.md`에 따라 구현되었는가?
- [x] 테스트 코드가 명확하고 읽기 쉬운가?
- [x] MSW를 활용한 API 모킹이 올바르게 설정되었는가?
- [x] 각 테스트는 독립적으로 실행 가능한가?
- [x] 테스트가 실패하는지 확인했는가? (Red 단계)
- [x] 테스트 데이터가 충분히 다양한가?
- [x] 에러 케이스가 포함되었는가?
- [x] 테스트 코드에 주석이 적절히 추가되었는가?

---

## 5. 다음 단계 (Hermes)

- 다이얼로그 상태 관리 (`isRepeatDeleteDialogOpen`, `pendingDeleteEvent`)
- 삭제 버튼 클릭 핸들러 수정
- "예"/"아니오" 핸들러 구현
- `DELETE /api/recurring-events/:repeatId` API 호출 로직
- 에러 처리 및 사용자 피드백
