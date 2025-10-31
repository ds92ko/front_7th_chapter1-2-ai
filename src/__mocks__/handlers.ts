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
    const eventsWithIds = body.events.map((event, index) => ({
      ...event,
      id: String(mockEvents.length + index + 1),
      repeat: { ...event.repeat, id: event.repeat.type !== 'none' ? 'repeat-id-123' : undefined },
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

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    const index = mockEvents.findIndex((event) => event.id === id);

    if (index !== -1) {
      mockEvents.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),
];

// 테스트 간 상태 초기화를 위한 함수
export const resetMockEvents = () => {
  mockEvents = [...initialEvents];
};
