import { describe, it, expect } from 'vitest';

import { EventForm } from '../../types';
import {
  generateDailyEvents,
  generateMonthlyEvents,
  generateRecurringEvents,
  generateWeeklyEvents,
  generateYearlyEvents,
  getDaysInMonth,
  isLeapYear,
} from '../../utils/recurringEvents';

describe('recurringEvents 유틸리티', () => {
  describe('isLeapYear', () => {
    it('4로 나누어떨어지는 일반 윤년을 판별한다', () => {
      // Given
      const years = [2024, 2028, 2032];

      // When & Then
      years.forEach((year) => {
        expect(isLeapYear(year)).toBe(true);
      });
    });

    it('100으로 나누어떨어지는 평년을 판별한다', () => {
      // Given
      const years = [1900, 2100, 2200];

      // When & Then
      years.forEach((year) => {
        expect(isLeapYear(year)).toBe(false);
      });
    });

    it('400으로 나누어떨어지는 윤년을 판별한다', () => {
      // Given
      const years = [2000, 2400];

      // When & Then
      years.forEach((year) => {
        expect(isLeapYear(year)).toBe(true);
      });
    });

    it('일반 평년을 판별한다', () => {
      // Given
      const years = [2025, 2026, 2027];

      // When & Then
      years.forEach((year) => {
        expect(isLeapYear(year)).toBe(false);
      });
    });
  });

  describe('getDaysInMonth', () => {
    it('31일인 달의 일수를 반환한다', () => {
      // Given
      const monthsWith31Days = [1, 3, 5, 7, 8, 10, 12];

      // When & Then
      monthsWith31Days.forEach((month) => {
        expect(getDaysInMonth(2025, month)).toBe(31);
      });
    });

    it('30일인 달의 일수를 반환한다', () => {
      // Given
      const monthsWith30Days = [4, 6, 9, 11];

      // When & Then
      monthsWith30Days.forEach((month) => {
        expect(getDaysInMonth(2025, month)).toBe(30);
      });
    });

    it('평년 2월의 일수(28일)를 반환한다', () => {
      // Given
      const year = 2025;
      const month = 2;

      // When
      const days = getDaysInMonth(year, month);

      // Then
      expect(days).toBe(28);
    });

    it('윤년 2월의 일수(29일)를 반환한다', () => {
      // Given
      const leapYears = [2024, 2028];

      // When & Then
      leapYears.forEach((year) => {
        expect(getDaysInMonth(year, 2)).toBe(29);
      });
    });
  });

  describe('generateDailyEvents', () => {
    const baseEvent: EventForm = {
      title: '매일 회의',
      date: '2025-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-11-05' },
      notificationTime: 10,
    };

    it('시작일부터 종료일까지 매일 반복 일정을 생성한다', () => {
      // Given
      const startDate = '2025-11-01';
      const endDate = '2025-11-05';
      const interval = 1;

      // When
      const events = generateDailyEvents(startDate, endDate, interval, baseEvent);

      // Then
      expect(events).toHaveLength(5);
      expect(events[0].date).toBe('2025-11-01');
      expect(events[1].date).toBe('2025-11-02');
      expect(events[2].date).toBe('2025-11-03');
      expect(events[3].date).toBe('2025-11-04');
      expect(events[4].date).toBe('2025-11-05');
      events.forEach((event) => {
        expect(event.title).toBe('매일 회의');
        expect(event.startTime).toBe('10:00');
        expect(event.endTime).toBe('11:00');
      });
    });

    it('간격이 2일 때 2일마다 반복 일정을 생성한다', () => {
      // Given
      const startDate = '2025-11-01';
      const endDate = '2025-11-10';
      const interval = 2;

      // When
      const events = generateDailyEvents(startDate, endDate, interval, baseEvent);

      // Then
      expect(events).toHaveLength(5);
      expect(events[0].date).toBe('2025-11-01');
      expect(events[1].date).toBe('2025-11-03');
      expect(events[2].date).toBe('2025-11-05');
      expect(events[3].date).toBe('2025-11-07');
      expect(events[4].date).toBe('2025-11-09');
    });

    it('종료일이 시작일과 같을 때 1개의 일정만 생성한다', () => {
      // Given
      const startDate = '2025-11-01';
      const endDate = '2025-11-01';
      const interval = 1;

      // When
      const events = generateDailyEvents(startDate, endDate, interval, baseEvent);

      // Then
      expect(events).toHaveLength(1);
      expect(events[0].date).toBe('2025-11-01');
    });
  });

  describe('generateWeeklyEvents', () => {
    const baseEvent: EventForm = {
      title: '주간 회의',
      date: '2025-11-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '주간 미팅',
      location: '회의실',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30' },
      notificationTime: 10,
    };

    it('시작일 요일 기준으로 매주 반복 일정을 생성한다', () => {
      // Given
      const startDate = '2025-11-01'; // 토요일
      const endDate = '2025-11-30';
      const interval = 1;

      // When
      const events = generateWeeklyEvents(startDate, endDate, interval, baseEvent);

      // Then
      expect(events).toHaveLength(5);
      expect(events[0].date).toBe('2025-11-01');
      expect(events[1].date).toBe('2025-11-08');
      expect(events[2].date).toBe('2025-11-15');
      expect(events[3].date).toBe('2025-11-22');
      expect(events[4].date).toBe('2025-11-29');
    });

    it('2주 간격으로 반복 일정을 생성한다', () => {
      // Given
      const startDate = '2025-11-01';
      const endDate = '2025-12-31';
      const interval = 2;

      // When
      const events = generateWeeklyEvents(startDate, endDate, interval, baseEvent);

      // Then
      expect(events).toHaveLength(5);
      expect(events[0].date).toBe('2025-11-01');
      expect(events[1].date).toBe('2025-11-15');
      expect(events[2].date).toBe('2025-11-29');
      expect(events[3].date).toBe('2025-12-13');
      expect(events[4].date).toBe('2025-12-27');
    });

    it('월 경계를 넘어가는 매주 반복 일정을 생성한다', () => {
      // Given
      const startDate = '2025-11-28'; // 금요일
      const endDate = '2025-12-31';
      const interval = 1;

      // When
      const events = generateWeeklyEvents(startDate, endDate, interval, baseEvent);

      // Then
      expect(events).toHaveLength(5);
      expect(events[0].date).toBe('2025-11-28');
      expect(events[1].date).toBe('2025-12-05');
      expect(events[2].date).toBe('2025-12-12');
      expect(events[3].date).toBe('2025-12-19');
      expect(events[4].date).toBe('2025-12-26');
    });
  });

  describe('generateMonthlyEvents', () => {
    const baseEvent: EventForm = {
      title: '월간 리뷰',
      date: '2025-01-15',
      startTime: '16:00',
      endTime: '17:00',
      description: '월간 회의',
      location: '회의실',
      category: '업무',
      repeat: { type: 'monthly', interval: 1, endDate: '2025-06-30' },
      notificationTime: 10,
    };

    it('모든 달에 존재하는 날짜로 매월 반복 일정을 생성한다', () => {
      // Given
      const startDate = '2025-01-15';
      const endDate = '2025-06-30';
      const interval = 1;

      // When
      const events = generateMonthlyEvents(startDate, endDate, interval, baseEvent);

      // Then
      expect(events).toHaveLength(6);
      expect(events[0].date).toBe('2025-01-15');
      expect(events[1].date).toBe('2025-02-15');
      expect(events[2].date).toBe('2025-03-15');
      expect(events[3].date).toBe('2025-04-15');
      expect(events[4].date).toBe('2025-05-15');
      expect(events[5].date).toBe('2025-06-15');
    });

    it('31일 매월 반복 시 31일이 없는 달은 건너뛴다', () => {
      // Given
      const startDate = '2025-01-31';
      const endDate = '2025-12-31';
      const interval = 1;
      const event31 = { ...baseEvent, date: '2025-01-31' };

      // When
      const events = generateMonthlyEvents(startDate, endDate, interval, event31);

      // Then
      expect(events).toHaveLength(7);
      expect(events[0].date).toBe('2025-01-31');
      expect(events[1].date).toBe('2025-03-31');
      expect(events[2].date).toBe('2025-05-31');
      expect(events[3].date).toBe('2025-07-31');
      expect(events[4].date).toBe('2025-08-31');
      expect(events[5].date).toBe('2025-10-31');
      expect(events[6].date).toBe('2025-12-31');
    });

    it('30일 매월 반복 시 2월은 건너뛴다', () => {
      // Given
      const startDate = '2025-01-30';
      const endDate = '2025-12-31';
      const interval = 1;
      const event30 = { ...baseEvent, date: '2025-01-30' };

      // When
      const events = generateMonthlyEvents(startDate, endDate, interval, event30);

      // Then
      // 2월만 건너뜀
      expect(events.every((event) => !event.date.includes('-02-'))).toBe(true);
      expect(events.filter((event) => event.date.includes('-01-')).length).toBe(1);
      expect(events.filter((event) => event.date.includes('-03-')).length).toBe(1);
    });

    it('윤년 2월 29일로 시작한 매월 반복은 2월만 생성한다', () => {
      // Given
      const startDate = '2024-02-29';
      const endDate = '2024-12-31';
      const interval = 1;
      const event29 = { ...baseEvent, date: '2024-02-29' };

      // When
      const events = generateMonthlyEvents(startDate, endDate, interval, event29);

      // Then
      expect(events).toHaveLength(1);
      expect(events[0].date).toBe('2024-02-29');
    });
  });

  describe('generateYearlyEvents', () => {
    const baseEvent: EventForm = {
      title: '연간 이벤트',
      date: '2025-03-05',
      startTime: '09:00',
      endTime: '10:00',
      description: '연간 행사',
      location: '본사',
      category: '업무',
      repeat: { type: 'yearly', interval: 1, endDate: '2029-12-31' },
      notificationTime: 10,
    };

    it('일반 날짜로 매년 반복 일정을 생성한다', () => {
      // Given
      const startDate = '2025-03-05';
      const endDate = '2029-12-31';
      const interval = 1;

      // When
      const events = generateYearlyEvents(startDate, endDate, interval, baseEvent);

      // Then
      expect(events).toHaveLength(5);
      expect(events[0].date).toBe('2025-03-05');
      expect(events[1].date).toBe('2026-03-05');
      expect(events[2].date).toBe('2027-03-05');
      expect(events[3].date).toBe('2028-03-05');
      expect(events[4].date).toBe('2029-03-05');
    });

    it('2월 29일 매년 반복은 윤년에만 생성한다', () => {
      // Given
      const startDate = '2024-02-29';
      const endDate = '2030-12-31';
      const interval = 1;
      const leapEvent = { ...baseEvent, date: '2024-02-29' };

      // When
      const events = generateYearlyEvents(startDate, endDate, interval, leapEvent);

      // Then
      expect(events).toHaveLength(2);
      expect(events[0].date).toBe('2024-02-29');
      expect(events[1].date).toBe('2028-02-29');
    });

    it('2년 간격으로 매년 반복 일정을 생성한다', () => {
      // Given
      const startDate = '2025-01-01';
      const endDate = '2033-12-31';
      const interval = 2;
      const event2Year = { ...baseEvent, date: '2025-01-01' };

      // When
      const events = generateYearlyEvents(startDate, endDate, interval, event2Year);

      // Then
      expect(events).toHaveLength(5);
      expect(events[0].date).toBe('2025-01-01');
      expect(events[1].date).toBe('2027-01-01');
      expect(events[2].date).toBe('2029-01-01');
      expect(events[3].date).toBe('2031-01-01');
      expect(events[4].date).toBe('2033-01-01');
    });
  });

  describe('generateRecurringEvents', () => {
    const baseEvent: EventForm = {
      title: '테스트 이벤트',
      date: '2025-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '테스트',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1, endDate: '2025-11-05' },
      notificationTime: 10,
    };

    it('daily 타입일 때 매일 반복 일정을 생성한다', () => {
      // Given
      const eventData = {
        ...baseEvent,
        repeat: { type: 'daily' as const, interval: 1, endDate: '2025-11-05' },
      };

      // When
      const events = generateRecurringEvents(eventData);

      // Then
      expect(events.length).toBeGreaterThan(0);
    });

    it('weekly 타입일 때 매주 반복 일정을 생성한다', () => {
      // Given
      const eventData = {
        ...baseEvent,
        repeat: { type: 'weekly' as const, interval: 1, endDate: '2025-11-30' },
      };

      // When
      const events = generateRecurringEvents(eventData);

      // Then
      expect(events.length).toBeGreaterThan(0);
    });

    it('monthly 타입일 때 매월 반복 일정을 생성한다', () => {
      // Given
      const eventData = {
        ...baseEvent,
        repeat: { type: 'monthly' as const, interval: 1, endDate: '2025-12-31' },
      };

      // When
      const events = generateRecurringEvents(eventData);

      // Then
      expect(events.length).toBeGreaterThan(0);
    });

    it('yearly 타입일 때 매년 반복 일정을 생성한다', () => {
      // Given
      const eventData = {
        ...baseEvent,
        repeat: { type: 'yearly' as const, interval: 1, endDate: '2028-12-31' },
      };

      // When
      const events = generateRecurringEvents(eventData);

      // Then
      expect(events.length).toBeGreaterThan(0);
    });

    it('none 타입일 때 빈 배열을 반환한다', () => {
      // Given
      const eventData = { ...baseEvent, repeat: { type: 'none' as const, interval: 1 } };

      // When
      const events = generateRecurringEvents(eventData);

      // Then
      expect(events).toEqual([]);
    });

    it('종료일이 없을 때 빈 배열을 반환한다', () => {
      // Given
      const eventData = { ...baseEvent, repeat: { type: 'daily' as const, interval: 1 } };

      // When
      const events = generateRecurringEvents(eventData);

      // Then
      expect(events).toEqual([]);
    });
  });
});
