import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRecurringEvents } from '../utils/recurringEvents';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    }
  };

  const saveEvent = async (eventData: Event | EventForm, editAllRecurring = false) => {
    try {
      let response;
      if (editing) {
        // 반복 일정 전체 수정
        if (editAllRecurring && (eventData as Event).repeat?.id) {
          const repeatId = (eventData as Event).repeat.id;
          const editingEventData = eventData as Event;

          // 같은 시리즈의 모든 일정 가져오기
          const seriesEvents = events.filter((e) => e.repeat.id === repeatId);
          const firstEvent = seriesEvents[0];

          // 날짜/시간 변경 여부 확인
          const dateChanged = editingEventData.date !== firstEvent.date;
          const timeChanged =
            editingEventData.startTime !== firstEvent.startTime ||
            editingEventData.endTime !== firstEvent.endTime;

          // 날짜나 시간이 변경된 경우
          if (dateChanged || timeChanged) {
            // 날짜 차이 계산
            let dateDiff = 0;
            if (dateChanged) {
              const oldDate = new Date(firstEvent.date);
              const newDate = new Date(editingEventData.date);
              dateDiff = Math.floor(
                (newDate.getTime() - oldDate.getTime()) / (1000 * 60 * 60 * 24)
              );
            }

            // 종료일 확인
            const endDate = firstEvent.repeat.endDate;

            // 각 일정을 개별적으로 업데이트 또는 삭제
            const updatePromises = seriesEvents.map(async (event) => {
              let updatedDate = event.date;

              // 날짜 이동
              if (dateDiff !== 0) {
                const eventDate = new Date(event.date);
                eventDate.setDate(eventDate.getDate() + dateDiff);
                const year = eventDate.getFullYear();
                const month = String(eventDate.getMonth() + 1).padStart(2, '0');
                const day = String(eventDate.getDate()).padStart(2, '0');
                updatedDate = `${year}-${month}-${day}`;
              }

              // 종료일을 넘는 일정은 삭제
              if (endDate && updatedDate > endDate) {
                return fetch(`/api/events/${event.id}`, { method: 'DELETE' });
              }

              // 일정 업데이트
              return fetch(`/api/events/${event.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...event,
                  date: updatedDate,
                  title: editingEventData.title,
                  description: editingEventData.description,
                  location: editingEventData.location,
                  category: editingEventData.category,
                  notificationTime: editingEventData.notificationTime,
                  startTime: editingEventData.startTime,
                  endTime: editingEventData.endTime,
                }),
              });
            });

            await Promise.all(updatePromises);
            response = { ok: true } as Response;
          } else {
            // 날짜/시간 변경이 없으면 기존 API 사용
            response = await fetch(`/api/recurring-events/${repeatId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: editingEventData.title,
                description: editingEventData.description,
                location: editingEventData.location,
                category: editingEventData.category,
                notificationTime: editingEventData.notificationTime,
              }),
            });
          }
        } else {
          // 단일 일정 수정
          response = await fetch(`/api/events/${(eventData as Event).id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
        }
      } else {
        // 반복 일정인 경우
        if (eventData.repeat.type !== 'none') {
          const recurringEvents = generateRecurringEvents(eventData as EventForm);
          response = await fetch('/api/events-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ events: recurringEvents }),
          });
        } else {
          // 단일 일정인 경우
          response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
          });
        }
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar('일정 저장 실패', { variant: 'error' });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    }
  };

  async function init() {
    await fetchEvents();
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent };
};
