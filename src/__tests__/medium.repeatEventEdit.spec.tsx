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

describe('반복 일정 수정', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-11-01'));
    resetMockEvents();
  });

  describe('TC-001: 다이얼로그 표시', () => {
    it('반복 일정 수정 시 선택 다이얼로그가 표시되어야 한다', async () => {
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

      // 반복 일정 클릭하여 수정 폼 열기
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // 제목 변경
      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '긴급 팀 회의');

      // 일정 추가 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // 다이얼로그 표시 확인
      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // 다이얼로그 내용 확인
      expect(within(dialog).getByText('반복 일정 수정')).toBeInTheDocument();
      expect(within(dialog).getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();

      // 버튼 확인
      const yesButton = within(dialog).getByRole('button', { name: '예' });
      const noButton = within(dialog).getByRole('button', { name: '아니오' });
      expect(yesButton).toBeInTheDocument();
      expect(noButton).toBeInTheDocument();
    });
  });

  describe('TC-002: "예" 선택 - 단일 수정', () => {
    it('"예"를 선택하면 해당 일정만 단일 일정으로 변환되어 수정되어야 한다', async () => {
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

      let apiCalled = false;
      let requestBody: Partial<Event> | null = null;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockRecurringEvents });
        }),
        http.put('/api/events/:id', async ({ request, params }) => {
          apiCalled = true;
          requestBody = (await request.json()) as Partial<Event>;
          const { id } = params;
          const updatedEvent = { ...requestBody, id };
          return HttpResponse.json(updatedEvent);
        })
      );

      const { user } = setup(<App />);

      // 첫 번째 반복 일정 클릭하여 수정
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // 제목 변경
      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '특별 회의');

      // 일정 추가 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // 다이얼로그에서 "예" 클릭
      const dialog = await screen.findByRole('dialog');
      const yesButton = within(dialog).getByRole('button', { name: '예' });
      await user.click(yesButton);

      // API 호출 확인
      await waitFor(() => {
        expect(apiCalled).toBe(true);
      });

      // Request body 확인: repeat.type이 'none'으로 설정되었는지
      expect(requestBody).not.toBeNull();
      expect(requestBody!.repeat?.type).toBe('none');
      expect(requestBody!.title).toBe('특별 회의');
    });
  });

  describe('TC-003: "아니오" 선택 - 전체 수정', () => {
    it('"아니오"를 선택하면 같은 시리즈의 모든 일정이 수정되어야 한다', async () => {
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

      let apiCalled = false;
      let requestBody: Partial<Event> | null = null;
      let calledRepeatId: string | undefined;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockRecurringEvents });
        }),
        http.put('/api/recurring-events/:repeatId', async ({ request, params }) => {
          apiCalled = true;
          calledRepeatId = params.repeatId as string;
          requestBody = (await request.json()) as Partial<Event>;

          // 모든 반복 일정 업데이트
          const updatedEvents = mockRecurringEvents.map((event) =>
            event.repeat.id === params.repeatId ? { ...event, ...requestBody } : event
          );

          return HttpResponse.json(updatedEvents.filter((e) => e.repeat.id === params.repeatId));
        })
      );

      const { user } = setup(<App />);

      // 두 번째 반복 일정 클릭하여 수정
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[1]);

      // 데이터 변경
      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '팀 미팅');

      const startTimeInput = screen.getByLabelText('시작 시간');
      await user.clear(startTimeInput);
      await user.type(startTimeInput, '14:00');

      const endTimeInput = screen.getByLabelText('종료 시간');
      await user.clear(endTimeInput);
      await user.type(endTimeInput, '15:00');

      const locationInput = screen.getByLabelText('위치');
      await user.clear(locationInput);
      await user.type(locationInput, '회의실 B');

      // 일정 추가 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // 다이얼로그에서 "아니오" 클릭
      const dialog = await screen.findByRole('dialog');
      const noButton = within(dialog).getByRole('button', { name: '아니오' });
      await user.click(noButton);

      // API 호출 확인
      await waitFor(() => {
        expect(apiCalled).toBe(true);
      });

      // repeatId 확인
      expect(calledRepeatId).toBe('repeat-456');

      // Request body 확인
      expect(requestBody).not.toBeNull();
      expect(requestBody!.title).toBe('팀 미팅');
      expect(requestBody!.startTime).toBe('14:00');
      expect(requestBody!.endTime).toBe('15:00');
      expect(requestBody!.location).toBe('회의실 B');
    });
  });

  describe('TC-004: 단일 일정 수정', () => {
    it('단일 일정 수정 시 다이얼로그가 표시되지 않아야 한다', async () => {
      const mockSingleEvent: Event = {
        id: 'single-1',
        title: '점심 약속',
        date: '2025-11-05',
        startTime: '12:00',
        endTime: '13:00',
        description: '동료와 점심',
        location: '식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      let apiCalled = false;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: [mockSingleEvent] });
        }),
        http.put('/api/events/:id', async ({ request, params }) => {
          apiCalled = true;
          const updatedEvent = await request.json();
          return HttpResponse.json({ ...updatedEvent, id: params.id });
        })
      );

      const { user } = setup(<App />);

      // 일정 클릭하여 수정 폼 열기
      const editButton = await screen.findByLabelText('Edit event');
      await user.click(editButton);

      // 제목 변경
      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '저녁 약속');

      // 일정 추가 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // 다이얼로그가 표시되지 않음 확인
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // API 호출 확인 (다이얼로그 없이 바로 호출됨)
      await waitFor(() => {
        expect(apiCalled).toBe(true);
      });
    });
  });

  describe('TC-005: 반복 아이콘 제거', () => {
    it('"예" 선택 후 수정된 일정의 반복 아이콘이 제거되어야 한다', async () => {
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
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-789' },
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
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-789' },
          notificationTime: 10,
        },
      ];

      let updatedEvents = [...mockRecurringEvents];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: updatedEvents });
        }),
        http.put('/api/events/:id', async ({ request, params }) => {
          const updatedEvent = (await request.json()) as Event;
          updatedEvents = updatedEvents.map((event) =>
            event.id === params.id ? { ...event, ...updatedEvent } : event
          );
          return HttpResponse.json({ ...updatedEvent, id: params.id });
        })
      );

      const { user } = setup(<App />);

      // 반복 일정 수정
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '특별 회의');

      await user.click(screen.getByTestId('event-submit-button'));

      // "예" 클릭
      const dialog = await screen.findByRole('dialog');
      const yesButton = within(dialog).getByRole('button', { name: '예' });
      await user.click(yesButton);

      // 수정된 일정에 반복 아이콘이 없는지 확인
      await waitFor(() => {
        const eventList = screen.getByTestId('event-list');
        const specialMeeting = within(eventList).getByText('특별 회의');
        const eventItem = specialMeeting.closest('li');

        // 반복 아이콘이 없어야 함
        expect(within(eventItem!).queryByTestId('RepeatIcon')).not.toBeInTheDocument();
      });
    });
  });

  describe('TC-006: 반복 아이콘 유지', () => {
    it('"아니오" 선택 후 모든 일정의 반복 아이콘이 유지되어야 한다', async () => {
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
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-999' },
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
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-999' },
          notificationTime: 10,
        },
      ];

      let updatedEvents = [...mockRecurringEvents];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: updatedEvents });
        }),
        http.put('/api/recurring-events/:repeatId', async ({ request, params }) => {
          const updateData = (await request.json()) as Partial<Event>;
          updatedEvents = updatedEvents.map((event) =>
            event.repeat.id === params.repeatId ? { ...event, ...updateData } : event
          );
          return HttpResponse.json(updatedEvents.filter((e) => e.repeat.id === params.repeatId));
        })
      );

      const { user } = setup(<App />);

      // 반복 일정 수정
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '팀 미팅');

      await user.click(screen.getByTestId('event-submit-button'));

      // "아니오" 클릭
      const dialog = await screen.findByRole('dialog');
      const noButton = within(dialog).getByRole('button', { name: '아니오' });
      await user.click(noButton);

      // 모든 일정에 반복 아이콘이 유지되는지 확인
      await waitFor(() => {
        const eventList = screen.getByTestId('event-list');
        const teamMeetings = within(eventList).getAllByText('팀 미팅');

        teamMeetings.forEach((meeting) => {
          const eventItem = meeting.closest('li');
          expect(within(eventItem!).getByTestId('RepeatIcon')).toBeInTheDocument();
        });
      });
    });
  });

  describe('TC-007: 다이얼로그 취소', () => {
    it('다이얼로그를 취소하면 수정이 취소되어야 한다', async () => {
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
          repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30', id: 'repeat-111' },
          notificationTime: 10,
        },
      ];

      let apiCalled = false;

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockRecurringEvents });
        }),
        http.put('/api/events/:id', () => {
          apiCalled = true;
          return HttpResponse.json({});
        }),
        http.put('/api/recurring-events/:repeatId', () => {
          apiCalled = true;
          return HttpResponse.json([]);
        })
      );

      const { user } = setup(<App />);

      // 반복 일정 수정 시도
      const editButton = await screen.findByLabelText('Edit event');
      await user.click(editButton);

      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '수정 시도');

      await user.click(screen.getByTestId('event-submit-button'));

      // 다이얼로그 표시
      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // ESC 키 누르기
      await user.keyboard('{Escape}');

      // 다이얼로그 닫힘 확인
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // API 호출되지 않음 확인
      expect(apiCalled).toBe(false);

      // 일정이 수정되지 않았는지 확인
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText('주간 회의')).toBeInTheDocument();
      expect(within(eventList).queryByText('수정 시도')).not.toBeInTheDocument();
    });
  });
});
