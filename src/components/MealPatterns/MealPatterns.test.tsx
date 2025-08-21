import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import '@testing-library/jest-dom';
import { MealPatterns } from './MealPatterns';
import type { MealPattern } from '../../models/MealPattern';
import type { Food } from '../../models/Food';

describe('MealPatterns', () => {
  const mockFoods: Food[] = [
    { id: 'rice', name: 'ご飯', protein: 4.0, unit: '茶碗1杯', category: 'grain', imageUrl: '/images/rice.png' },
    { id: 'natto', name: '納豆', protein: 8.3, unit: '1パック', category: 'soy', imageUrl: '/images/natto.png' },
    { id: 'egg', name: '卵', protein: 6.2, unit: '1個', category: 'egg', imageUrl: '/images/egg.png' },
    { id: 'miso-soup', name: '味噌汁', protein: 2.0, unit: '1杯', category: 'other', imageUrl: '/images/miso-soup.png' },
    { id: 'bread', name: 'パン', protein: 5.0, unit: '1枚', category: 'grain', imageUrl: '/images/bread.png' },
    { id: 'cheese', name: 'チーズ', protein: 4.5, unit: '1枚', category: 'dairy', imageUrl: '/images/cheese.png' },
    { id: 'ham', name: 'ハム', protein: 3.5, unit: '2枚', category: 'meat', imageUrl: '/images/ham.png' },
    { id: 'milk', name: '牛乳', protein: 6.6, unit: '200ml', category: 'dairy', imageUrl: '/images/milk.png' },
    { id: 'yogurt', name: 'ヨーグルト', protein: 4.3, unit: '100g', category: 'dairy', imageUrl: '/images/yogurt.png' },
    { id: 'granola', name: 'グラノーラ', protein: 3.0, unit: '50g', category: 'grain', imageUrl: '/images/granola.png' },
    { id: 'banana', name: 'バナナ', protein: 1.1, unit: '1本', category: 'other', imageUrl: '/images/banana.png' },
  ];

  const mockPatterns: MealPattern[] = [
    {
      id: 'japanese-set',
      name: '和食セット',
      description: '定番の和朝食',
      foods: [mockFoods[0], mockFoods[1], mockFoods[2], mockFoods[3]],
      totalProtein: 20.5,
      category: 'japanese',
      icon: '🍚'
    },
    {
      id: 'western-set',
      name: '洋食セット',
      description: 'パンとハムチーズ',
      foods: [mockFoods[4], mockFoods[5], mockFoods[6], mockFoods[7]],
      totalProtein: 19.6,
      category: 'western',
      icon: '🥖'
    },
    {
      id: 'yogurt-set',
      name: 'ヨーグルトセット',
      description: 'ヨーグルトとグラノーラ',
      foods: [mockFoods[8], mockFoods[9], mockFoods[10], mockFoods[7]],
      totalProtein: 15.0,
      category: 'yogurt',
      icon: '🥛'
    }
  ];

  it('献立パターンのリストを表示する', () => {
    const onSelectPattern = vi.fn();
    render(() => <MealPatterns patterns={mockPatterns} onSelectPattern={onSelectPattern} />);

    expect(screen.getByText('和食セット')).toBeInTheDocument();
    expect(screen.getByText('洋食セット')).toBeInTheDocument();
    expect(screen.getByText('ヨーグルトセット')).toBeInTheDocument();
  });

  it('各献立の詳細情報を表示する', () => {
    const onSelectPattern = vi.fn();
    render(() => <MealPatterns patterns={mockPatterns} onSelectPattern={onSelectPattern} />);

    expect(screen.getByText('定番の和朝食')).toBeInTheDocument();
    expect(screen.getByText('20.5g')).toBeInTheDocument();
    
    expect(screen.getByText('パンとハムチーズ')).toBeInTheDocument();
    expect(screen.getByText('19.6g')).toBeInTheDocument();
  });

  it('献立に含まれる食品を表示する', () => {
    const onSelectPattern = vi.fn();
    render(() => <MealPatterns patterns={mockPatterns} onSelectPattern={onSelectPattern} />);

    expect(screen.getByText('ご飯')).toBeInTheDocument();
    expect(screen.getByText('納豆')).toBeInTheDocument();
    expect(screen.getByText('卵')).toBeInTheDocument();
    expect(screen.getByText('味噌汁')).toBeInTheDocument();
  });

  it('献立をクリックすると選択イベントが発火する', () => {
    const onSelectPattern = vi.fn();
    render(() => <MealPatterns patterns={mockPatterns} onSelectPattern={onSelectPattern} />);

    const japaneseSet = screen.getByTestId('pattern-japanese-set');
    fireEvent.click(japaneseSet);

    expect(onSelectPattern).toHaveBeenCalledWith(mockPatterns[0]);
  });

  it('複数の献立を選択できる', () => {
    const onSelectPattern = vi.fn();
    render(() => <MealPatterns patterns={mockPatterns} onSelectPattern={onSelectPattern} />);

    const japaneseSet = screen.getByTestId('pattern-japanese-set');
    const westernSet = screen.getByTestId('pattern-western-set');

    fireEvent.click(japaneseSet);
    fireEvent.click(westernSet);

    expect(onSelectPattern).toHaveBeenCalledTimes(2);
    expect(onSelectPattern).toHaveBeenNthCalledWith(1, mockPatterns[0]);
    expect(onSelectPattern).toHaveBeenNthCalledWith(2, mockPatterns[1]);
  });

  it('選択された献立にスタイルが適用される', () => {
    const onSelectPattern = vi.fn();
    const { rerender } = render(() => 
      <MealPatterns 
        patterns={mockPatterns} 
        selectedPatternIds={['japanese-set']}
        onSelectPattern={onSelectPattern} 
      />
    );

    const japaneseSet = screen.getByTestId('pattern-japanese-set');
    expect(japaneseSet).toHaveClass('selected');

    const westernSet = screen.getByTestId('pattern-western-set');
    expect(westernSet).not.toHaveClass('selected');
  });

  it('カテゴリーごとにアイコンが表示される', () => {
    const onSelectPattern = vi.fn();
    render(() => <MealPatterns patterns={mockPatterns} onSelectPattern={onSelectPattern} />);

    expect(screen.getByText('🍚')).toBeInTheDocument();
    expect(screen.getByText('🥖')).toBeInTheDocument();
    expect(screen.getByText('🥛')).toBeInTheDocument();
  });

  it('献立がない場合は空の状態を表示する', () => {
    const onSelectPattern = vi.fn();
    render(() => <MealPatterns patterns={[]} onSelectPattern={onSelectPattern} />);

    expect(screen.getByText('献立パターンがありません')).toBeInTheDocument();
  });
});