import type { Food } from '../models/Food';

export interface RecommendedFood extends Food {
  reason: string;
  proteinGap: number;
}

export interface RecommendationResult {
  recommendations: RecommendedFood[];
  remainingProtein: number;
  isTargetMet: boolean;
}

export interface CombinationSuggestion {
  foods: Food[];
  totalProtein: number;
  description: string;
  categoryBalance: number;
}

export class MealRecommenderService {
  static getRecommendations(
    selectedFoods: Food[],
    allFoods: Food[],
    targetProtein: number = 20
  ): RecommendationResult {
    const currentProtein = selectedFoods.reduce((sum, food) => sum + food.protein, 0);
    const remainingProtein = Math.max(0, targetProtein - currentProtein);
    
    if (remainingProtein === 0) {
      return {
        recommendations: [],
        remainingProtein: 0,
        isTargetMet: true,
      };
    }
    
    const selectedIds = new Set(selectedFoods.map(f => f.id));
    const selectedCategories = selectedFoods.map(f => f.category);
    
    // 選択されていない食品を取得
    const availableFoods = allFoods.filter(food => !selectedIds.has(food.id));
    
    // スコアリング
    const scoredFoods = availableFoods.map(food => {
      let score = 0;
      
      // タンパク質効率スコア
      const proteinEfficiency = food.protein / remainingProtein;
      if (proteinEfficiency >= 0.8 && proteinEfficiency <= 1.2) {
        score += 50; // 理想的な量
      } else if (proteinEfficiency >= 0.5 && proteinEfficiency <= 1.5) {
        score += 30; // 適切な量
      } else {
        score += 10 * Math.min(1, proteinEfficiency); // 少なすぎるか多すぎる
      }
      
      // カテゴリーバランススコア
      const categoryCount = selectedCategories.filter(c => c === food.category).length;
      if (categoryCount === 0) {
        score += 30; // 新しいカテゴリー
      } else if (categoryCount === 1) {
        score += 10; // 既存カテゴリー
      }
      
      // タンパク質量ボーナス
      score += food.protein * 2;
      
      return { ...food, score };
    });
    
    // スコア順にソート
    scoredFoods.sort((a, b) => b.score - a.score);
    
    // 推薦理由を付与
    const recommendations: RecommendedFood[] = scoredFoods.slice(0, 5).map(food => {
      const proteinGap = remainingProtein - food.protein;
      let reason = '';
      
      if (food.protein >= remainingProtein * 0.8 && food.protein <= remainingProtein * 1.2) {
        reason = `不足分（${remainingProtein.toFixed(1)}g）にぴったり`;
      } else if (food.protein > remainingProtein) {
        reason = `1品で目標達成（タンパク質${food.protein}g）`;
      } else {
        reason = `高タンパク質で効率的（${food.protein}g）`;
      }
      
      const categoryCount = selectedCategories.filter(c => c === food.category).length;
      if (categoryCount === 0) {
        reason += '、カテゴリーバランス良好';
      }
      
      return {
        ...food,
        reason,
        proteinGap: Math.abs(proteinGap),
      };
    });
    
    return {
      recommendations,
      remainingProtein,
      isTargetMet: false,
    };
  }
  
  static getCombinationSuggestions(
    selectedFoods: Food[],
    allFoods: Food[],
    targetProtein: number = 20
  ): CombinationSuggestion[] {
    const currentProtein = selectedFoods.reduce((sum, food) => sum + food.protein, 0);
    const remainingProtein = Math.max(0, targetProtein - currentProtein);
    
    if (remainingProtein === 0) {
      return [];
    }
    
    const selectedIds = new Set(selectedFoods.map(f => f.id));
    const availableFoods = allFoods.filter(food => !selectedIds.has(food.id));
    
    const suggestions: CombinationSuggestion[] = [];
    
    // 1品で達成パターン
    const singleFoodSuggestions = availableFoods
      .filter(food => food.protein >= remainingProtein)
      .slice(0, 2)
      .map(food => ({
        foods: [...selectedFoods, food],
        totalProtein: currentProtein + food.protein,
        description: `${food.name}1品で目標達成`,
        categoryBalance: this.calculateCategoryBalance([...selectedFoods, food]),
      }));
    
    suggestions.push(...singleFoodSuggestions);
    
    // 2品組み合わせパターン
    for (let i = 0; i < availableFoods.length - 1 && suggestions.length < 5; i++) {
      for (let j = i + 1; j < availableFoods.length && suggestions.length < 5; j++) {
        const combo = [availableFoods[i], availableFoods[j]];
        const comboProtein = combo.reduce((sum, f) => sum + f.protein, 0);
        
        if (comboProtein >= remainingProtein && comboProtein <= remainingProtein * 1.5) {
          suggestions.push({
            foods: [...selectedFoods, ...combo],
            totalProtein: currentProtein + comboProtein,
            description: `${combo.map(f => f.name).join('と')}の組み合わせ`,
            categoryBalance: this.calculateCategoryBalance([...selectedFoods, ...combo]),
          });
        }
      }
    }
    
    // 3品バランス型パターン
    if (suggestions.length < 3) {
      const balancedCombo = this.findBalancedCombination(
        availableFoods,
        remainingProtein,
        3
      );
      
      if (balancedCombo.length > 0) {
        suggestions.push({
          foods: [...selectedFoods, ...balancedCombo],
          totalProtein: currentProtein + balancedCombo.reduce((sum, f) => sum + f.protein, 0),
          description: 'バランス重視の組み合わせ',
          categoryBalance: this.calculateCategoryBalance([...selectedFoods, ...balancedCombo]),
        });
      }
    }
    
    // カテゴリーバランスでソート
    suggestions.sort((a, b) => b.categoryBalance - a.categoryBalance);
    
    return suggestions.slice(0, 3);
  }
  
  private static calculateCategoryBalance(foods: Food[]): number {
    const categories = foods.map(f => f.category);
    const uniqueCategories = new Set(categories);
    const categoryCount = uniqueCategories.size;
    const totalFoods = foods.length;
    
    // カテゴリー多様性スコア
    const diversityScore = categoryCount / totalFoods;
    
    // カテゴリーの偏りペナルティ
    const categoryCounts = new Map<string, number>();
    categories.forEach(cat => {
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    });
    
    const maxCount = Math.max(...Array.from(categoryCounts.values()));
    const balancePenalty = maxCount / totalFoods;
    
    return diversityScore * 100 * (1 - balancePenalty * 0.5);
  }
  
  private static findBalancedCombination(
    foods: Food[],
    targetProtein: number,
    maxItems: number
  ): Food[] {
    // 異なるカテゴリーから選択
    const categoryGroups = new Map<string, Food[]>();
    foods.forEach(food => {
      const category = food.category;
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(food);
    });
    
    const combination: Food[] = [];
    let currentProtein = 0;
    
    // 各カテゴリーから1つずつ選択
    for (const [category, categoryFoods] of categoryGroups) {
      if (combination.length >= maxItems) break;
      if (currentProtein >= targetProtein) break;
      
      // タンパク質量でソート
      categoryFoods.sort((a, b) => b.protein - a.protein);
      
      // 適切な食品を選択
      const suitable = categoryFoods.find(food => 
        currentProtein + food.protein <= targetProtein * 1.3
      );
      
      if (suitable) {
        combination.push(suitable);
        currentProtein += suitable.protein;
      }
    }
    
    // 目標に達していない場合、追加
    if (currentProtein < targetProtein && combination.length < maxItems) {
      const remaining = foods
        .filter(f => !combination.includes(f))
        .sort((a, b) => Math.abs(targetProtein - currentProtein - a.protein) - 
                       Math.abs(targetProtein - currentProtein - b.protein));
      
      if (remaining[0]) {
        combination.push(remaining[0]);
      }
    }
    
    return combination;
  }
}