import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import App from '../../App';

describe('반복 종료일 입력 제한', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-01'));
  });

  describe('TC-001: max 속성 검증', () => {
    it('반복 종료일 필드에 max 속성이 2025-12-31로 설정되어 있어야 한다', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 일정 추가 버튼 클릭
      const addButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(addButton);

      // 반복 유형 선택
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      const weeklyOption = await screen.findByRole('option', { name: '매주' });
      await user.click(weeklyOption);

      // 반복 종료일 입력 필드 찾기
      const repeatEndDateInput = screen.getByLabelText('반복 종료일') as HTMLInputElement;

      // max 속성 검증
      expect(repeatEndDateInput).toHaveAttribute('max', '2025-12-31');
    });
  });

  describe('TC-002: 반복 유형별 max 속성 검증', () => {
    it.each([
      { type: 'daily', label: '매일' },
      { type: 'weekly', label: '매주' },
      { type: 'monthly', label: '매월' },
      { type: 'yearly', label: '매년' },
    ])('$type 반복 유형에서도 max 속성이 2025-12-31이어야 한다', async ({ label }) => {
      const user = userEvent.setup();
      render(<App />);

      // 일정 추가 버튼 클릭
      const addButton = screen.getByRole('button', { name: /일정 추가/i });
      await user.click(addButton);

      // 반복 유형 선택
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      const option = await screen.findByRole('option', { name: label });
      await user.click(option);

      // 반복 종료일 입력 필드 찾기
      const repeatEndDateInput = screen.getByLabelText('반복 종료일') as HTMLInputElement;

      // max 속성 검증
      expect(repeatEndDateInput).toHaveAttribute('max', '2025-12-31');
    });
  });
});
