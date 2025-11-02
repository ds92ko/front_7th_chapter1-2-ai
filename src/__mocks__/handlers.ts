import { http, HttpResponse } from 'msw';

import { events as initialEvents } from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

// 상태 유지를 위한 이벤트 배열
let mockEvents: Event[] = [...initialEvents];

export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events: mockEvents });
  }),

  http.post('/api/events', async ({ request }) => {
    const newEvent = (await request.json()) as Event;
    newEvent.id = String(mockEvents.length + 1);
    mockEvents.push(newEvent);
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.post('/api/events-list', async ({ request }) => {
    const body = (await request.json()) as { events: Event[] };
    // 반복 일정 시리즈마다 고유한 ID 생성
    const repeatId = body.events[0]?.repeat?.type !== 'none' 
      ? `repeat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      : undefined;
    
    const eventsWithIds = body.events.map((event, index) => ({
      ...event,
      id: String(mockEvents.length + index + 1),
      repeat: { ...event.repeat, id: event.repeat.type !== 'none' ? repeatId : undefined },
    }));
    mockEvents.push(...eventsWithIds);
    return HttpResponse.json(eventsWithIds, { status: 201 }); // 배열 직접 반환
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;
    const index = mockEvents.findIndex((event) => event.id === id);

    if (index !== -1) {
      mockEvents[index] = { ...mockEvents[index], ...updatedEvent };
      return HttpResponse.json(mockEvents[index]);
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.put('/api/events-list', async ({ request }) => {
    const body = (await request.json()) as { events: Event[] };
    let isUpdated = false;

    body.events.forEach((event) => {
      const index = mockEvents.findIndex((e) => e.id === event.id);
      if (index !== -1) {
        isUpdated = true;
        mockEvents[index] = { ...mockEvents[index], ...event };
      }
    });

    if (isUpdated) {
      return HttpResponse.json(mockEvents);
    }

    return new HttpResponse('Event not found', { status: 404 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = mockEvents.findIndex((event) => event.id === id);

    if (index !== -1) {
      mockEvents.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),

  http.delete('/api/events-list', async ({ request }) => {
    const body = (await request.json()) as { eventIds: string[] };
    mockEvents = mockEvents.filter((event) => !body.eventIds.includes(event.id));
    return new HttpResponse(null, { status: 204 });
  }),

  http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
    const { repeatId } = params;
    const updateData = (await request.json()) as Partial<Event>;
    const seriesEvents = mockEvents.filter((event) => event.repeat.id === repeatId);

    if (seriesEvents.length === 0) {
      return new HttpResponse('Recurring series not found', { status: 404 });
    }

    mockEvents = mockEvents.map((event) => {
      if (event.repeat.id === repeatId) {
        return {
          ...event,
          title: updateData.title !== undefined ? updateData.title : event.title,
          description:
            updateData.description !== undefined ? updateData.description : event.description,
          location: updateData.location !== undefined ? updateData.location : event.location,
          category: updateData.category !== undefined ? updateData.category : event.category,
          notificationTime:
            updateData.notificationTime !== undefined
              ? updateData.notificationTime
              : event.notificationTime,
          startTime: updateData.startTime !== undefined ? updateData.startTime : event.startTime,
          endTime: updateData.endTime !== undefined ? updateData.endTime : event.endTime,
        };
      }
      return event;
    });

    return HttpResponse.json(seriesEvents);
  }),
];

// 테스트 간 상태 초기화를 위한 함수
export const resetMockEvents = () => {
  mockEvents = [...initialEvents];
};
