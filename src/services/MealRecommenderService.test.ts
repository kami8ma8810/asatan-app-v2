import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MealRecommenderService } from './MealRecommenderService';
import type { Food } from '../models/Food';

describe('MealRecommenderService', () => {
  const mockFoods: Food[] = [
    { id: 'chicken_salad_1', name: 'サラダチキン', protein: 21.7, unit: '1個', category: 'meat', imageUrl: '/images/chicken.png' },
    { id: 'salmon_1', name: '鮭（1切れ）', protein: 17.8, unit: '1切れ', category: 'fish', imageUrl: '/images/salmon.png' },
    { id: 'egg_1', name: '卵（1個）', protein: 6.2, unit: '1個', category: 'egg', imageUrl: '/images/egg.png' },
    { id: 'natto_1', name: '納豆（1パック）', protein: 8.3, unit: '1パック', category: 'soy', imageUrl: '/images/natto.png' },
    { id: 'milk_1', name: '牛乳（200ml）', protein: 6.6, unit: '200ml', category: 'dairy', imageUrl: '/images/milk.png' },
    { id: 'yogurt_1', name: 'ヨーグルト（1個）', protein: 4.3, unit: '1個', category: 'dairy', imageUrl: '/images/yogurt.png' },
    { id: 'bread_1', name: '食パン（6枚切1枚）', protein: 5.6, unit: '1枚', category: 'grain', imageUrl: '/images/bread.png' },
    { id: 'rice_1', name: 'ご飯（茶碗1杯）', protein: 3.8, unit: '1杯', category: 'grain', imageUrl: '/images/rice.png' },
    { id: 'tofu_1', name: '豆腐（半丁）', protein: 10.0, unit: '半丁', category: 'soy', imageUrl: '/images/tofu.png' },
    { id: 'cheese_1', name: 'チーズ（1枚）', protein: 4.5, unit: '1枚', category: 'dairy', imageUrl: '/images/cheese.png' },
  ];

  describe('getRecommendations', () => {
    it('目標タンパク質量に達するための食品を推薦する', () => {
      const selectedFoods = [mockFoods[6]]; // 食パン: 5.6g
      const targetProtein = 20;
      
      const recommendations = MealRecommenderService.getRecommendations(
        selectedFoods,
        mockFoods,
        targetProtein
      );
      
      // 不足分は14.4g
      expect(recommendations.remainingProtein).toBe(14.4);
      expect(recommendations.recommendations.length).toBeGreaterThan(0);
      
      // サラダチキン（21.7g）が含まれるべき
      expect(recommendations.recommendations.some(r => r.id === 'chicken_salad_1')).toBe(true);
    });

    it('すでに目標を達成している場合は推薦しない', () => {
      const selectedFoods = [mockFoods[0]]; // サラダチキン: 21.7g
      const targetProtein = 20;
      
      const recommendations = MealRecommenderService.getRecommendations(
        selectedFoods,
        mockFoods,
        targetProtein
      );
      
      expect(recommendations.remainingProtein).toBe(0);
      expect(recommendations.recommendations.length).toBe(0);
      expect(recommendations.isTargetMet).toBe(true);
    });

    it('カテゴリーバランスを考慮した推薦をする', () => {
      const selectedFoods = [mockFoods[2], mockFoods[3]]; // 卵 + 納豆: 14.5g
      const targetProtein = 20;
      
      const recommendations = MealRecommenderService.getRecommendations(
        selectedFoods,
        mockFoods,
        targetProtein
      );
      
      // 既に卵とsoyがあるので、他のカテゴリーが優先されるべき
      const topRecommendations = recommendations.recommendations.slice(0, 3);
      const categories = topRecommendations.map(r => r.category);
      
      // 異なるカテゴリーが推薦されることを確認
      expect(categories.includes('meat') || categories.includes('fish') || categories.includes('dairy')).toBe(true);
    });

    it('選択済みの食品は推薦から除外される', () => {
      const selectedFoods = [mockFoods[0], mockFoods[1]]; // サラダチキン + 鮭
      const targetProtein = 50;
      
      const recommendations = MealRecommenderService.getRecommendations(
        selectedFoods,
        mockFoods,
        targetProtein
      );
      
      // 選択済みの食品は推薦に含まれない
      expect(recommendations.recommendations.some(r => r.id === 'chicken_salad_1')).toBe(false);
      expect(recommendations.recommendations.some(r => r.id === 'salmon_1')).toBe(false);
    });

    it('効率的な組み合わせを提案する', () => {
      const selectedFoods: Food[] = [];
      const targetProtein = 20;
      
      const recommendations = MealRecommenderService.getRecommendations(
        selectedFoods,
        mockFoods,
        targetProtein
      );
      
      // タンパク質量が多い食品が上位に来るべき
      const topRecommendation = recommendations.recommendations[0];
      expect(topRecommendation.protein).toBeGreaterThanOrEqual(10);
    });

    it('推薦理由を提供する', () => {
      const selectedFoods = [mockFoods[6]]; // 食パン: 5.6g
      const targetProtein = 20;
      
      const recommendations = MealRecommenderService.getRecommendations(
        selectedFoods,
        mockFoods,
        targetProtein
      );
      
      const topRecommendation = recommendations.recommendations[0];
      expect(topRecommendation.reason).toBeDefined();
      expect(topRecommendation.reason).toContain('タンパク質');
    });
  });

  describe('getCombinationSuggestions', () => {
    it('複数の組み合わせパターンを提案する', () => {
      const selectedFoods = [mockFoods[6]]; // 食パン: 5.6g
      const targetProtein = 20;
      
      const suggestions = MealRecommenderService.getCombinationSuggestions(
        selectedFoods,
        mockFoods,
        targetProtein
      );
      
      expect(suggestions.length).toBeGreaterThan(0);
      
      // 各提案が目標を達成していることを確認
      suggestions.forEach(suggestion => {
        const totalProtein = suggestion.foods.reduce((sum, food) => sum + food.protein, 0);
        expect(totalProtein).toBeGreaterThanOrEqual(targetProtein);
      });
    });

    it('バランスの良い組み合わせを提案する', () => {
      const selectedFoods: Food[] = [];
      const targetProtein = 20;
      
      const suggestions = MealRecommenderService.getCombinationSuggestions(
        selectedFoods,
        mockFoods,
        targetProtein
      );
      
      // 最初の提案を確認
      const firstSuggestion = suggestions[0];
      const categories = [...new Set(firstSuggestion.foods.map(f => f.category))];
      
      // 複数のカテゴリーが含まれることを確認
      expect(categories.length).toBeGreaterThanOrEqual(2);
    });

    it('効率的な組み合わせを優先する', () => {
      const selectedFoods: Food[] = [];
      const targetProtein = 20;
      
      const suggestions = MealRecommenderService.getCombinationSuggestions(
        selectedFoods,
        mockFoods,
        targetProtein
      );
      
      // 最初の提案は少ない品数で目標達成すべき
      const firstSuggestion = suggestions[0];
      expect(firstSuggestion.foods.length).toBeLessThanOrEqual(3);
    });
  });
});