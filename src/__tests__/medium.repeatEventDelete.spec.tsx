import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { resetMockEvents } from '../__mocks__/handlers';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

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

describe('반복 일정 삭제', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-11-01'));
    resetMockEvents();
  });

  describe('TC-001: 다이얼로그 표시', () => {
    it('반복 일정 삭제 시 선택 다이얼로그가 표시되어야 한다', async () => {
      // Mock 반복 일정 생성
      const mockRecurringEvents: Event[] = [
        {
          id: 'recurring-1',
          title: '주간 회의',
          date: '2025-11-01',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 팀 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-123' },
          notificationTime: 10,
        },
        {
          id: 'recurring-2',
          title: '주간 회의',
          date: '2025-11-08',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 팀 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-123' },
          notificationTime: 10,
        },
      ];

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
  });

  describe('TC-002: "예" 선택 - 단일 삭제', () => {
    it('"예"를 선택하면 해당 일정만 삭제되어야 한다', async () => {
      const mockRecurringEvents: Event[] = [
        {
          id: 'recurring-1',
          title: '주간 회의',
          date: '2025-11-01',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 팀 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-123' },
          notificationTime: 10,
        },
        {
          id: 'recurring-2',
          title: '주간 회의',
          date: '2025-11-08',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 팀 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-123' },
          notificationTime: 10,
        },
        {
          id: 'recurring-3',
          title: '주간 회의',
          date: '2025-11-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 팀 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-123' },
          notificationTime: 10,
        },
      ];

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
  });

  describe('TC-003: "아니오" 선택 - 전체 삭제', () => {
    it('"아니오"를 선택하면 같은 시리즈의 모든 일정이 삭제되어야 한다', async () => {
      const mockRecurringEvents: Event[] = [
        {
          id: 'recurring-1',
          title: '주간 회의',
          date: '2025-11-01',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 팀 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-456' },
          notificationTime: 10,
        },
        {
          id: 'recurring-2',
          title: '주간 회의',
          date: '2025-11-08',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 팀 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-456' },
          notificationTime: 10,
        },
        {
          id: 'recurring-3',
          title: '주간 회의',
          date: '2025-11-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 팀 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-456' },
          notificationTime: 10,
        },
      ];

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
  });

  describe('TC-004: 단일 일정 삭제', () => {
    it('단일 일정 삭제 시 다이얼로그가 표시되지 않아야 한다', async () => {
      const mockSingleEvent: Event = {
        id: 'single-1',
        title: '점심 약속',
        date: '2025-11-10',
        startTime: '12:00',
        endTime: '13:00',
        description: '동료와 점심',
        location: '식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      let deletedEventId: string | null = null;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: [mockSingleEvent] });
        }),
        http.delete('/api/events/:id', ({ params }) => {
          deletedEventId = params.id as string;
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { user } = setup(<App />);

      // 단일 일정 삭제 버튼 클릭
      const deleteButton = await screen.findByLabelText('Delete event');
      await user.click(deleteButton);

      // 다이얼로그가 표시되지 않음 확인
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // API 호출 확인
      await waitFor(() => {
        expect(deletedEventId).toBe('single-1');
      });

      // 성공 메시지 확인
      expect(await screen.findByText('일정이 삭제되었습니다.')).toBeInTheDocument();
    });
  });

  describe('TC-005: 다이얼로그 취소', () => {
    it('다이얼로그를 취소하면 삭제가 취소되어야 한다', async () => {
      const mockRecurringEvents: Event[] = [
        {
          id: 'recurring-1',
          title: '주간 회의',
          date: '2025-11-01',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 팀 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-123' },
          notificationTime: 10,
        },
      ];

      let apiCalled = false;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockRecurringEvents });
        }),
        http.delete('/api/events/:id', () => {
          apiCalled = true;
          return new HttpResponse(null, { status: 204 });
        }),
        http.delete('/api/recurring-events/:repeatId', () => {
          apiCalled = true;
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { user } = setup(<App />);

      // 반복 일정 삭제 버튼 클릭
      const deleteButton = await screen.findByLabelText('Delete event');
      await user.click(deleteButton);

      // 다이얼로그 표시 확인
      await screen.findByRole('dialog');

      // ESC 키로 취소 (또는 외부 클릭)
      await user.keyboard('{Escape}');

      // 다이얼로그가 닫힘 확인
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // API 호출이 없었는지 확인
      expect(apiCalled).toBe(false);

      // 일정이 여전히 존재하는지 확인
      expect((await screen.findAllByText('주간 회의')).length).toBeGreaterThan(0);
    });
  });

  describe('TC-006: 다이얼로그 연속 작동', () => {
    it.skip('다이얼로그를 여러 번 열고 닫아도 정상 작동해야 한다', async () => {
      const mockEvents: Event[] = [
        {
          id: 'recurring-1',
          title: '회의 A',
          date: '2025-11-01',
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-111' },
          notificationTime: 10,
        },
        {
          id: 'recurring-2',
          title: '회의 B',
          date: '2025-11-02',
          startTime: '14:00',
          endTime: '15:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-222' },
          notificationTime: 10,
        },
      ];

      const deletedIds: string[] = [];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.delete('/api/events/:id', ({ params }) => {
          deletedIds.push(params.id as string);
          return new HttpResponse(null, { status: 204 });
        }),
        http.delete('/api/recurring-events/:repeatId', ({ params }) => {
          deletedIds.push(params.repeatId as string);
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { user } = setup(<App />);

      // 첫 번째 일정 삭제 버튼 클릭
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // 다이얼로그에서 "예" 클릭 (단일 삭제)
      let dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: '예' }));

      await waitFor(() => {
        expect(deletedIds).toContain('recurring-1');
      });

      // 화면 갱신 대기 및 두 번째 일정 찾기
      const meetingB = await screen.findByText('회의 B');
      const meetingBContainer = meetingB.closest('div')?.closest('div');
      const deleteButton2 = within(meetingBContainer!).getByLabelText('Delete event');
      await user.click(deleteButton2);

      // 다이얼로그에서 "아니오" 클릭 (전체 삭제)
      dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: '아니오' }));

      await waitFor(() => {
        expect(deletedIds).toContain('repeat-222');
      });
    });
  });

  describe('TC-007: API 실패 시 에러 처리', () => {
    it('삭제 API 호출이 실패할 때 에러가 올바르게 처리되어야 한다', async () => {
      const mockRecurringEvents: Event[] = [
        {
          id: 'recurring-1',
          title: '주간 회의',
          date: '2025-11-01',
          startTime: '10:00',
          endTime: '11:00',
          description: '주간 팀 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-123' },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockRecurringEvents });
        }),
        http.delete('/api/recurring-events/:repeatId', () => {
          return new HttpResponse('Recurring series not found', { status: 404 });
        })
      );

      const { user } = setup(<App />);

      // 반복 일정 삭제 버튼 클릭
      const deleteButton = await screen.findByLabelText('Delete event');
      await user.click(deleteButton);

      // 다이얼로그에서 "아니오" 클릭
      const dialog = await screen.findByRole('dialog');
      const noButton = within(dialog).getByRole('button', { name: '아니오' });
      await user.click(noButton);

      // 에러 메시지 확인
      expect(await screen.findByText('일정 삭제 실패')).toBeInTheDocument();

      // 일정이 여전히 존재하는지 확인
      expect((await screen.findAllByText('주간 회의')).length).toBeGreaterThan(0);
    });
  });
});
