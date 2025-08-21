import { MealPattern } from '../models/MealPattern';
import { foods } from './foods';
import { Food } from '../models/Food';

// 食品名から食品を取得するヘルパー関数
const getFoodsByNames = (names: string[]): Food[] => {
  return names.map(name => foods.find(f => f.name === name)).filter(Boolean) as Food[];
};

// 総タンパク質を計算するヘルパー関数
const calculateTotalProtein = (foodNames: string[]): number => {
  const selectedFoods = getFoodsByNames(foodNames);
  return Number(selectedFoods.reduce((sum, food) => sum + food.protein, 0).toFixed(1));
};

// 献立パターンの定義
export const mealPatterns: MealPattern[] = [
  {
    id: 'japanese-traditional',
    name: '和食セット',
    description: '定番の和朝食',
    foods: getFoodsByNames(['白米', '納豆', '卵', '豆腐 絹']),
    totalProtein: calculateTotalProtein(['白米', '納豆', '卵', '豆腐 絹']),
    category: 'japanese',
    icon: '🍚'
  },
  {
    id: 'western-classic',
    name: '洋食セット',
    description: 'パンとハムチーズの朝食',
    foods: getFoodsByNames(['食パン', 'チーズ', 'ハム', '牛乳']),
    totalProtein: calculateTotalProtein(['食パン', 'チーズ', 'ハム', '牛乳']),
    category: 'western',
    icon: '🥖'
  },
  {
    id: 'yogurt-granola',
    name: 'ヨーグルトセット',
    description: 'ヨーグルトとコーンフレーク',
    foods: getFoodsByNames(['ヨーグルト', 'コーンフレーク', '牛乳']),
    totalProtein: calculateTotalProtein(['ヨーグルト', 'コーンフレーク', '牛乳']),
    category: 'yogurt',
    icon: '🥛'
  },
  {
    id: 'protein-boost',
    name: 'プロテインブースト',
    description: '高タンパク質セット',
    foods: getFoodsByNames(['鶏むね肉', '卵', 'ヨーグルト', '納豆']),
    totalProtein: calculateTotalProtein(['鶏むね肉', '卵', 'ヨーグルト', '納豆']),
    category: 'balanced',
    icon: '💪'
  },
  {
    id: 'light-morning',
    name: 'ライトモーニング',
    description: '軽めの朝食',
    foods: getFoodsByNames(['クロワッサン', '牛乳']),
    totalProtein: calculateTotalProtein(['クロワッサン', '牛乳']),
    category: 'light',
    icon: '☕'
  },
  {
    id: 'egg-toast',
    name: 'エッグトースト',
    description: 'トーストと卵の組み合わせ',
    foods: getFoodsByNames(['食パン', '卵', 'ベーコン', '豆乳']),
    totalProtein: calculateTotalProtein(['食パン', '卵', 'ベーコン', '豆乳']),
    category: 'western',
    icon: '🍳'
  },
  {
    id: 'japanese-fish',
    name: '和食魚定食',
    description: '焼き魚の和朝食',
    foods: getFoodsByNames(['白米', 'さけ', '豆腐 木綿', '納豆']),
    totalProtein: calculateTotalProtein(['白米', 'さけ', '豆腐 木綿', '納豆']),
    category: 'japanese',
    icon: '🐟'
  },
  {
    id: 'soy-protein',
    name: '大豆たっぷり',
    description: '大豆製品中心の朝食',
    foods: getFoodsByNames(['豆乳', '納豆', '豆腐 木綿', '厚揚げ']),
    totalProtein: calculateTotalProtein(['豆乳', '納豆', '豆腐 木綿', '厚揚げ']),
    category: 'balanced',
    icon: '🌱'
  },
  {
    id: 'meat-lover',
    name: '肉好きセット',
    description: '肉類たっぷり',
    foods: getFoodsByNames(['ソーセージ', 'ハム', 'ベーコン', '卵']),
    totalProtein: calculateTotalProtein(['ソーセージ', 'ハム', 'ベーコン', '卵']),
    category: 'western',
    icon: '🥓'
  },
  {
    id: 'oatmeal-mix',
    name: 'オートミール',
    description: 'オートミールとヨーグルト',
    foods: getFoodsByNames(['オートミール', 'ヨーグルト', '牛乳', 'ピーナツ']),
    totalProtein: calculateTotalProtein(['オートミール', 'ヨーグルト', '牛乳', 'ピーナツ']),
    category: 'balanced',
    icon: '🥣'
  }
];

// 将来的にAPI連携する際のインターフェース
export interface MealPatternAPI {
  fetchPatterns(): Promise<MealPattern[]>;
  searchPatterns(query: string): Promise<MealPattern[]>;
  getPatternById(id: string): Promise<MealPattern | null>;
  createCustomPattern(pattern: Omit<MealPattern, 'id'>): Promise<MealPattern>;
}

// API連携のモック実装（将来的に実際のAPIに置き換え可能）
export class MealPatternService implements MealPatternAPI {
  private patterns: MealPattern[] = mealPatterns;

  async fetchPatterns(): Promise<MealPattern[]> {
    // 将来的にはここで外部APIを呼び出す
    // const response = await fetch('https://api.nutrition.jp/meal-patterns');
    // return response.json();
    return Promise.resolve(this.patterns);
  }

  async searchPatterns(query: string): Promise<MealPattern[]> {
    const lowerQuery = query.toLowerCase();
    return Promise.resolve(
      this.patterns.filter(p => 
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
      )
    );
  }

  async getPatternById(id: string): Promise<MealPattern | null> {
    return Promise.resolve(this.patterns.find(p => p.id === id) || null);
  }

  async createCustomPattern(pattern: Omit<MealPattern, 'id'>): Promise<MealPattern> {
    const newPattern = {
      ...pattern,
      id: `custom-${Date.now()}`
    };
    this.patterns.push(newPattern);
    return Promise.resolve(newPattern);
  }
}

export const mealPatternService = new MealPatternService();