import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(); // ? Med: 이걸 왜 써야하는지 물어보자

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  const newEvent: Event = {
    id: '1',
    title: '새 회의',
    date: '2025-10-16',
    startTime: '11:00',
    endTime: '12:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toEqual([{ ...newEvent, id: '1' }]);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  const updatedEvent: Event = {
    id: '1',
    date: '2025-10-15',
    startTime: '09:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    title: '수정된 회의',
    endTime: '11:00',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  expect(result.current.events[0]).toEqual(updatedEvent);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([]);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });

  server.resetHandlers();
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  const nonExistentEvent: Event = {
    id: '999', // 존재하지 않는 ID
    title: '존재하지 않는 이벤트',
    date: '2025-07-20',
    startTime: '09:00',
    endTime: '10:00',
    description: '이 이벤트는 존재하지 않습니다',
    location: '어딘가',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });

  expect(result.current.events).toHaveLength(1);
});

describe('useEventOperations - 반복 일정', () => {
  it('반복 일정 저장 시 /api/events-list를 호출한다', async () => {
    // Given
    server.use(
      http.post('/api/events-list', async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          events: (body as { events: Event[] }).events.map((event, index) => ({
            ...event,
            id: `recurring-${index}`,
            repeat: { ...event.repeat, id: 'repeat-id-123' },
          })),
        });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const recurringEvent = {
      title: '반복 회의',
      date: '2025-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '매주 회의',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily' as const, interval: 1, endDate: '2025-11-03' },
      notificationTime: 10,
    };

    // When
    await act(async () => {
      await result.current.saveEvent(recurringEvent);
    });

    // Then
    expect(result.current.events.length).toBeGreaterThan(0);
  });

  it('반복 일정 저장 성공 시 이벤트 목록을 갱신한다', async () => {
    // Given
    const savedEvents: Event[] = [];

    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: savedEvents });
      }),
      http.post('/api/events-list', async ({ request }) => {
        const body = await request.json();
        const newEvents = (body as { events: Event[] }).events.map((event, index) => ({
          ...event,
          id: `recurring-${index}`,
          repeat: { ...event.repeat, id: 'repeat-id-123' },
        }));
        savedEvents.push(...newEvents);
        return HttpResponse.json(newEvents);
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const recurringEvent = {
      title: '매일 미팅',
      date: '2025-11-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '매일 반복',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily' as const, interval: 1, endDate: '2025-11-05' },
      notificationTime: 10,
    };

    // When
    await act(async () => {
      await result.current.saveEvent(recurringEvent);
    });

    // Then
    expect(result.current.events.length).toBeGreaterThan(0);
    result.current.events.forEach((event) => {
      expect(event.repeat.id).toBeDefined();
    });
  });

  it('반복 일정 저장 성공 시 성공 메시지를 표시한다', async () => {
    // Given
    server.use(
      http.post('/api/events-list', async ({ request }) => {
        const body = await request.json();
        return HttpResponse.json({
          events: (body as { events: Event[] }).events.map((event, index) => ({
            ...event,
            id: `recurring-${index}`,
            repeat: { ...event.repeat, id: 'repeat-id-123' },
          })),
        });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const recurringEvent = {
      title: '반복 이벤트',
      date: '2025-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily' as const, interval: 1, endDate: '2025-11-03' },
      notificationTime: 10,
    };

    // When
    await act(async () => {
      await result.current.saveEvent(recurringEvent);
    });

    // Then
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
      variant: 'success',
    });
  });

  it('단일 일정(repeat.type=none) 저장 시 기존 API를 호출한다', async () => {
    // Given
    setupMockHandlerCreation();

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const singleEvent = {
      id: '1',
      title: '단일 회의',
      date: '2025-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '일반 회의',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    };

    // When
    await act(async () => {
      await result.current.saveEvent(singleEvent);
    });

    // Then
    expect(result.current.events.length).toBeGreaterThan(0);
  });

  it('반복 일정 저장 실패 시 에러 메시지를 표시한다', async () => {
    // Given
    server.use(
      http.post('/api/events-list', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await act(() => Promise.resolve(null));

    const recurringEvent = {
      title: '실패할 반복 이벤트',
      date: '2025-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily' as const, interval: 1, endDate: '2025-11-03' },
      notificationTime: 10,
    };

    // When
    await act(async () => {
      await result.current.saveEvent(recurringEvent);
    });

    // Then
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });
});
