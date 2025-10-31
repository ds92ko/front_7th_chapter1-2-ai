import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../App';

describe('반복 일정 아이콘 표시', () => {
  describe('주별 뷰', () => {
    it('주별 뷰에서 반복 일정에 Repeat 아이콘이 표시된다', async () => {
      // Given: 반복 일정 생성
      render(<App />);
      
      // 일정 로딩 대기
      await screen.findByText('일정 로딩 완료!');
      
      // When: 반복 일정이 있는 주별 뷰로 이동
      // (테스트 데이터에 반복 일정 추가 필요)
      
      // Then: Repeat 아이콘 확인
      const weekView = screen.getByTestId('week-view');
      const repeatIcon = within(weekView).queryByTestId('RepeatIcon');
      
      expect(repeatIcon).toBeInTheDocument();
    });
  });

  describe('월별 뷰', () => {
    it('월별 뷰에서 반복 일정에 Repeat 아이콘이 표시된다', async () => {
      // Given: 반복 일정 생성
      render(<App />);
      
      // 일정 로딩 대기
      await screen.findByText('일정 로딩 완료!');
      
      // When: 월별 뷰에서 확인
      const monthView = screen.getByTestId('month-view');
      
      // Then: Repeat 아이콘 확인
      const repeatIcon = within(monthView).queryByTestId('RepeatIcon');
      
      expect(repeatIcon).toBeInTheDocument();
    });
  });

  describe('일반 일정', () => {
    it('일반 일정에는 Repeat 아이콘이 표시되지 않는다', async () => {
      // Given: 일반 일정만 있음
      render(<App />);
      
      // 일정 로딩 대기
      await screen.findByText('일정 로딩 완료!');
      
      // When: 월별 뷰에서 확인
      const monthView = screen.getByTestId('month-view');
      
      // Then: Repeat 아이콘 없음
      const repeatIcons = within(monthView).queryAllByTestId('RepeatIcon');
      
      // 일반 일정에는 아이콘이 없어야 함
      expect(repeatIcons).toHaveLength(0);
    });
  });

  describe('복합 케이스', () => {
    it('알림 + 반복 일정은 두 아이콘이 모두 표시된다', async () => {
      // Given: 알림 + 반복 일정
      render(<App />);
      
      // 일정 로딩 대기
      await screen.findByText('일정 로딩 완료!');
      
      // When: 해당 일정 확인
      const monthView = screen.getByTestId('month-view');
      
      // Then: 두 아이콘 모두 존재
      // (Notifications와 Repeat 아이콘)
      const notificationIcon = within(monthView).queryByTestId('NotificationsIcon');
      const repeatIcon = within(monthView).queryByTestId('RepeatIcon');
      
      // 두 아이콘이 동시에 표시되어야 함
      expect(notificationIcon).toBeInTheDocument();
      expect(repeatIcon).toBeInTheDocument();
    });
  });
});

