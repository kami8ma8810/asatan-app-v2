import { createFood, type Food } from "../models/Food";

export const foodsData: Food[] = [
  // 豆類・大豆製品
  createFood("厚揚げ", 2, "item01.jpg"),
  createFood("ピーナツ", 2, "item02.jpg"),
  createFood("煮大豆", 3, "item03.jpg"),
  createFood("豆腐 木綿", 3, "item04.jpg"),
  createFood("豆腐 絹", 3, "item05.jpg"),
  createFood("納豆", 4, "item13.jpg"),
  
  // 乳製品
  createFood("ヨーグルト", 3, "item06.jpg"),
  createFood("チーズ", 4, "item07.jpg"),
  createFood("牛乳", 5, "item09.jpg"),
  createFood("豆乳", 5, "item10.jpg"),
  
  // 魚介類
  createFood("ししゃも", 2, "item11.jpg"),
  createFood("ツナ缶", 4, "item12.jpg"),
  createFood("さば", 4, "item14.jpg"),
  createFood("さけ", 5, "item15.jpg"),
  createFood("さけフレーク", 6, "item16.jpg"),
  createFood("魚肉ソーセージ", 7, "item17.jpg"),
  
  // 穀物・パン類
  createFood("白米", 3, "item18.jpg"),
  createFood("クロワッサン", 3, "item19.jpg"),
  createFood("ドーナツ", 3, "item20.jpg"),
  createFood("コーンフレーク", 3, "item21.jpg"),
  createFood("玄米ご飯", 4, "item22.jpg"),
  createFood("オートミール", 4, "item23.jpg"),
  createFood("食パン", 4, "item24.jpg"),
  createFood("レーズンパン", 5, "item25.jpg"),
  createFood("うどん・そうめん", 5, "item26.jpg"),
  createFood("メロンパン", 6, "item27.jpg"),
  createFood("あんぱん", 7, "item28.jpg"),
  
  // 肉類・加工品
  createFood("ソーセージ", 2, "item29.jpg"),
  createFood("ベーコン", 2, "item30.jpg"),
  createFood("ハム", 3, "item31.jpg"),
  createFood("ハンバーグ", 3, "item32.jpg"),
  createFood("鶏むね肉", 5, "item08.jpg"),
  
  // 卵類
  createFood("卵焼き", 2, "item33.jpg"),
  createFood("プリン", 5, "item34.jpg"),
  createFood("卵", 6, "item35.jpg"),
];

// カテゴリー別に食品を取得するヘルパー関数
export const getFoodsByCategory = (category: FoodCategory): Food[] => {
  const categoryRanges: Record<FoodCategory, [number, number]> = {
    "豆類・大豆製品": [0, 5],
    "乳製品": [6, 9],
    "魚介類": [10, 15],
    "穀物・パン類": [16, 26],
    "肉類・加工品": [27, 31],
    "卵類": [32, 35],
  };
  
  const [start, end] = categoryRanges[category];
  return foodsData.slice(start, end + 1);
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