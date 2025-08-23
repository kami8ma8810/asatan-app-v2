import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@solidjs/testing-library';
import '@testing-library/jest-dom';
import { MealPatterns } from './MealPatterns';
import { MealPatternsService } from '../../services/MealPatternsService';
import type { MealPatternsResponse } from '../../types/MealPattern';

vi.mock('../../services/MealPatternsService');

const mockPatternsResponse: MealPatternsResponse = {
  patterns: [
    {
      id: 'pattern_1',
      name: 'サラダチキン中心の朝食',
      description: 'サラダチキンをメインにしたシンプルな朝食（108kcal）',
      total_protein: 21.7,
      total_energy: 108,
      total_fat: 1.5,
      total_carbs: 0.1,
      pfc_score: 0,
      category: 'single',
      tags: null,
      icon: null,
      popularity: 0,
      is_auto_generated: 0,
      main_food_id: null,
      created_at: '2025-08-21 09:48:09',
      updated_at: '2025-08-21 09:48:09',
      foods: [
        {
          food_id: 'chicken_salad_1',
          quantity: 1,
          serving_size: null,
          food_name: 'サラダチキン',
          food_protein: 21.7,
        },
      ],
    },
    {
      id: 'pattern_2',
      name: '和朝食セット（ご飯・納豆・卵）',
      description: '定番の和食スタイル（443kcal, P:18.3g, F:11.7g, C:62.0g）',
      total_protein: 18.3,
      total_energy: 443,
      total_fat: 11.7,
      total_carbs: 62.0,
      pfc_score: 97.37,
      category: 'japanese',
      tags: null,
      icon: null,
      popularity: 0,
      is_auto_generated: 0,
      main_food_id: null,
      created_at: '2025-08-21 09:48:09',
      updated_at: '2025-08-21 09:48:09',
      foods: [
        {
          food_id: 'egg_1',
          quantity: 1,
          serving_size: null,
          food_name: '卵（1個）',
          food_protein: 6.2,
        },
        {
          food_id: 'natto_1',
          quantity: 1,
          serving_size: null,
          food_name: '納豆（1パック）',
          food_protein: 8.3,
        },
        {
          food_id: 'rice_1',
          quantity: 1,
          serving_size: null,
          food_name: 'ご飯（茶碗1杯）',
          food_protein: 3.8,
        },
      ],
    },
  ],
  pagination: {
    limit: 20,
    offset: 0,
    hasMore: false,
  },
};

describe('MealPatterns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('献立パターンを表示する', async () => {
    vi.mocked(MealPatternsService.fetchPatterns).mockResolvedValue(mockPatternsResponse);

    render(() => <MealPatterns onSelect={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('献立パターン')).toBeInTheDocument();
      expect(screen.getByText('サラダチキン中心の朝食')).toBeInTheDocument();
      expect(screen.getByText('和朝食セット（ご飯・納豆・卵）')).toBeInTheDocument();
    });
  });

  it('献立パターンの詳細情報を表示する', async () => {
    vi.mocked(MealPatternsService.fetchPatterns).mockResolvedValue(mockPatternsResponse);

    render(() => <MealPatterns onSelect={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('21.7g')).toBeInTheDocument();
      expect(screen.getByText('108kcal')).toBeInTheDocument();
      expect(screen.getByText('18.3g')).toBeInTheDocument();
      expect(screen.getByText('443kcal')).toBeInTheDocument();
    });
  });

  it('カテゴリーフィルターが機能する', async () => {
    vi.mocked(MealPatternsService.fetchPatterns).mockResolvedValue(mockPatternsResponse);

    render(() => <MealPatterns onSelect={() => {}} />);

    await waitFor(() => {
      const japaneseFilter = screen.getByRole('button', { name: /和食/i });
      expect(japaneseFilter).toBeInTheDocument();
    });

    const japaneseFilter = screen.getByRole('button', { name: /和食/i });
    fireEvent.click(japaneseFilter);

    await waitFor(() => {
      expect(MealPatternsService.fetchPatterns).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'japanese' })
      );
    });
  });

  it('献立を選択できる', async () => {
    vi.mocked(MealPatternsService.fetchPatterns).mockResolvedValue(mockPatternsResponse);
    const onSelect = vi.fn();

    render(() => <MealPatterns onSelect={onSelect} />);

    await waitFor(() => {
      const selectButton = screen.getAllByRole('button', { name: /選択/i })[0];
      expect(selectButton).toBeInTheDocument();
    });

    const selectButton = screen.getAllByRole('button', { name: /選択/i })[0];
    fireEvent.click(selectButton);

    expect(onSelect).toHaveBeenCalledWith(mockPatternsResponse.patterns[0]);
  });

  it('ローディング状態を表示する', () => {
    vi.mocked(MealPatternsService.fetchPatterns).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(() => <MealPatterns onSelect={() => {}} />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('エラー状態を表示する', async () => {
    vi.mocked(MealPatternsService.fetchPatterns).mockRejectedValue(
      new Error('Failed to fetch')
    );

    render(() => <MealPatterns onSelect={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
    });
  });

  it('食品ごとのタンパク質量を表示する', async () => {
    vi.mocked(MealPatternsService.fetchPatterns).mockResolvedValue(mockPatternsResponse);

    render(() => <MealPatterns onSelect={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('サラダチキン')).toBeInTheDocument();
      expect(screen.getByText('卵（1個）')).toBeInTheDocument();
      expect(screen.getByText('納豆（1パック）')).toBeInTheDocument();
      expect(screen.getByText('ご飯（茶碗1杯）')).toBeInTheDocument();
    });
  });

  it('人気順でソートできる', async () => {
    vi.mocked(MealPatternsService.fetchPatterns).mockResolvedValue(mockPatternsResponse);

    render(() => <MealPatterns onSelect={() => {}} />);

    await waitFor(() => {
      const sortButton = screen.getByRole('button', { name: /タンパク質順/i });
      expect(sortButton).toBeInTheDocument();
    });

    const sortButton = screen.getByRole('button', { name: /タンパク質順/i });
    fireEvent.click(sortButton);

    await waitFor(() => {
      expect(MealPatternsService.fetchPatterns).toHaveBeenCalledWith(
        expect.objectContaining({ popular: true })
      );
    });
  });
});