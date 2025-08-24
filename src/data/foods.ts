import { createFood, type Food } from "../models/Food";
import { foodImageDataList } from "./foodImageData";

// foodImageDataListから自動生成
export const foodsData: Food[] = foodImageDataList.map(data => 
  createFood(
    data.name,
    data.protein,
    data.imageFile,
    data.serving,
    data.weight,
    data.category
  )
);

// デフォルトのエクスポート
export const foods = foodsData;

// カテゴリー別に食品を取得するヘルパー関数
export const getFoodsByCategory = (category: FoodCategory): Food[] => {
  return foodsData.filter(food => food.category === category);
};

export type FoodCategory = 
  | "豆類・大豆製品"
  | "乳製品"
  | "魚介類"
  | "穀物・パン類"
  | "肉類・加工品"
  | "卵類";

export const foodCategories: FoodCategory[] = [
  "豆類・大豆製品",
  "乳製品",
  "魚介類",
  "穀物・パン類",
  "肉類・加工品",
  "卵類",
];

// カテゴリーマッピング（表示用）
export const categoryMapping = {
  'soy': '豆類・大豆製品',
  'dairy': '乳製品',
  'fish': '魚介類',
  'grain': '穀物・パン類',
  'meat': '肉類・加工品',
  'egg': '卵類',
} as const;