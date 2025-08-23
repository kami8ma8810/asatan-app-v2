import { createFood, type Food } from "../models/Food";

export const foodsData: Food[] = [
  // 豆類・大豆製品
  createFood("厚揚げ", 2, "item01.jpg", "1枚", "soy"),
  createFood("ピーナツ", 2, "item02.jpg", "30g", "soy"),
  createFood("煮大豆", 3, "item03.jpg", "50g", "soy"),
  createFood("豆腐 木綿", 3, "item04.jpg", "100g", "soy"),
  createFood("豆腐 絹", 3, "item05.jpg", "100g", "soy"),
  createFood("納豆", 4, "item14.jpg", "1パック", "soy"),
  
  // 乳製品
  createFood("ヨーグルト", 3, "item06.jpg", "100g", "dairy"),
  createFood("チーズ", 4, "item07.jpg", "1枚", "dairy"),
  createFood("牛乳", 5, "item09.jpg", "200ml", "dairy"),
  createFood("豆乳", 5, "item10.jpg", "200ml", "dairy"),
  
  // 魚介類
  createFood("ししゃも", 2, "item11.jpg", "2尾", "fish"),
  createFood("ツナ缶", 4, "item12.jpg", "1缶", "fish"),
  createFood("さば", 4, "item13.jpg", "1切れ", "fish"),
  createFood("さけ", 5, "item16.jpg", "1切れ", "fish"),
  createFood("さけフレーク", 6, "item17.jpg", "大さじ2", "fish"),
  createFood("魚肉ソーセージ", 7, "item18.jpg", "1本", "fish"),
  
  // 穀物・パン類
  createFood("白米", 3, "item19.jpg", "茶碗1杯", "grain"),
  createFood("クロワッサン", 3, "item20.jpg", "1個", "grain"),
  createFood("ドーナツ", 3, "item21.jpg", "1個", "grain"),
  createFood("コーンフレーク", 3, "item22.jpg", "40g", "grain"),
  createFood("玄米ご飯", 4, "item23.jpg", "茶碗1杯", "grain"),
  createFood("オートミール", 4, "item24.jpg", "30g", "grain"),
  createFood("食パン", 4, "item25.jpg", "1枚", "grain"),
  createFood("レーズンパン", 5, "item26.jpg", "1枚", "grain"),
  createFood("うどん・そうめん", 5, "item27.jpg", "1玉", "grain"),
  createFood("メロンパン", 6, "item28.jpg", "1個", "grain"),
  createFood("あんぱん", 7, "item29.jpg", "1個", "grain"),
  
  // 肉類・加工品
  createFood("ソーセージ", 2, "item30.jpg", "2本", "meat"),
  createFood("ベーコン", 2, "item31.jpg", "2枚", "meat"),
  createFood("ハム", 3, "item32.jpg", "2枚", "meat"),
  createFood("ハンバーグ", 3, "item33.jpg", "1個", "meat"),
  createFood("鶏むね肉", 5, "item08.jpg", "100g", "meat"),
  
  // 卵類
  createFood("卵焼き", 2, "item34.jpg", "1切れ", "egg"),
  createFood("プリン", 5, "item35.jpg", "1個", "egg"),
  createFood("卵", 6, "item36.jpg", "1個", "egg"),
];

// デフォルトのエクスポート
export const foods = foodsData;

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