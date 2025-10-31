import { EventForm } from '../types';

// 상수 정의
const MONTHS_IN_YEAR = 12;
const DAYS_IN_WEEK = 7;
const FEBRUARY = 2;
const FEBRUARY_LEAP_DAYS = 29;
const FEBRUARY_NORMAL_DAYS = 28;
const MONTHS_WITH_30_DAYS = [4, 6, 9, 11];
const DAYS_IN_LONG_MONTH = 31;
const DAYS_IN_SHORT_MONTH = 30;

/**
 * 윤년 판별 함수
 * 4로 나누어떨어지고, 100으로 나누어떨어지지 않거나, 400으로 나누어떨어지면 윤년
 */
export const isLeapYear = (year: number): boolean => {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  if (year % 4 === 0) return true;
  return false;
};

/**
 * 특정 연도와 월의 일수를 반환하는 함수
 */
export const getDaysInMonth = (year: number, month: number): number => {
  if (month === FEBRUARY) {
    return isLeapYear(year) ? FEBRUARY_LEAP_DAYS : FEBRUARY_NORMAL_DAYS;
  }
  if (MONTHS_WITH_30_DAYS.includes(month)) {
    return DAYS_IN_SHORT_MONTH;
  }
  return DAYS_IN_LONG_MONTH;
};

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 */
const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * 이벤트 데이터를 특정 날짜로 복사
 */
const createEventForDate = (eventData: EventForm, date: Date): EventForm => {
  return {
    ...eventData,
    date: formatDateString(date),
  };
};

/**
 * 매일 반복 일정 생성
 */
export const generateDailyEvents = (
  startDate: string,
  endDate: string,
  interval: number,
  eventData: EventForm
): EventForm[] => {
  const events: EventForm[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let currentDate = new Date(start);

  while (currentDate <= end) {
    events.push(createEventForDate(eventData, currentDate));
    currentDate.setDate(currentDate.getDate() + interval);
  }

  return events;
};

/**
 * 매주 반복 일정 생성
 */
export const generateWeeklyEvents = (
  startDate: string,
  endDate: string,
  interval: number,
  eventData: EventForm
): EventForm[] => {
  const events: EventForm[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let currentDate = new Date(start);

  while (currentDate <= end) {
    events.push(createEventForDate(eventData, currentDate));
    currentDate.setDate(currentDate.getDate() + DAYS_IN_WEEK * interval);
  }

  return events;
};

/**
 * 매월 반복 일정 생성
 * 31일 매월 반복 시 31일이 없는 달은 건너뜀
 * 2월 29일로 시작한 경우 2월에만 생성 (특수 규칙)
 */
export const generateMonthlyEvents = (
  startDate: string,
  endDate: string,
  interval: number,
  eventData: EventForm
): EventForm[] => {
  const events: EventForm[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const targetDay = start.getDate();
  const startMonth = start.getMonth() + 1;

  // 특수 케이스: 2월 29일로 시작한 경우 2월에만 생성
  const isFebruary29 = startMonth === FEBRUARY && targetDay === FEBRUARY_LEAP_DAYS;

  let year = start.getFullYear();
  let month = start.getMonth() + 1;

  while (true) {
    // 2월 29일 특수 규칙: 2월에만 생성
    if (isFebruary29 && month !== FEBRUARY) {
      // 다음 월로 이동
      month += interval;
      while (month > MONTHS_IN_YEAR) {
        month -= MONTHS_IN_YEAR;
        year += 1;
      }
      // 종료 조건 체크
      const nextMonthFirstDay = new Date(year, month - 1, 1);
      if (nextMonthFirstDay > end) break;
      continue;
    }

    const daysInMonth = getDaysInMonth(year, month);

    // 해당 월에 targetDay가 존재하는 경우에만 생성
    if (targetDay <= daysInMonth) {
      const currentDate = new Date(year, month - 1, targetDay);

      if (currentDate > end) break;

      events.push(createEventForDate(eventData, currentDate));
    }

    // 다음 월로 이동
    month += interval;
    while (month > MONTHS_IN_YEAR) {
      month -= MONTHS_IN_YEAR;
      year += 1;
    }

    // 종료 조건 체크 (해당 월의 1일이 종료일을 넘으면 종료)
    const nextMonthFirstDay = new Date(year, month - 1, 1);
    if (nextMonthFirstDay > end) break;
  }

  return events;
};

/**
 * 매년 반복 일정 생성
 * 2월 29일 매년 반복 시 윤년에만 생성
 */
export const generateYearlyEvents = (
  startDate: string,
  endDate: string,
  interval: number,
  eventData: EventForm
): EventForm[] => {
  const events: EventForm[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const targetMonth = start.getMonth() + 1;
  const targetDay = start.getDate();

  let year = start.getFullYear();

  while (true) {
    const daysInMonth = getDaysInMonth(year, targetMonth);

    // 해당 연도의 해당 월에 targetDay가 존재하는 경우에만 생성
    // (2월 29일 매년 반복 시 윤년만)
    if (targetDay <= daysInMonth) {
      const currentDate = new Date(year, targetMonth - 1, targetDay);

      if (currentDate > end) break;

      events.push(createEventForDate(eventData, currentDate));
    }

    // 다음 연도로 이동
    year += interval;

    // 종료 조건 체크
    const nextYearDate = new Date(year, 0, 1);
    if (nextYearDate > end) break;
  }

  return events;
};

/**
 * 반복 일정 생성 메인 함수
 */
export const generateRecurringEvents = (eventData: EventForm): EventForm[] => {
  const { repeat, date } = eventData;

  // 반복 없음
  if (repeat.type === 'none') {
    return [];
  }

  // 종료일 없음
  if (!repeat.endDate) {
    return [];
  }

  const startDate = date;
  const endDate = repeat.endDate;
  const interval = repeat.interval;

  switch (repeat.type) {
    case 'daily':
      return generateDailyEvents(startDate, endDate, interval, eventData);
    case 'weekly':
      return generateWeeklyEvents(startDate, endDate, interval, eventData);
    case 'monthly':
      return generateMonthlyEvents(startDate, endDate, interval, eventData);
    case 'yearly':
      return generateYearlyEvents(startDate, endDate, interval, eventData);
    default:
      return [];
  }
};
