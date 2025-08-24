// 画像から読み取った食品データ
// 各画像ファイル（item01.jpg〜item35.jpg）に対応する情報を記録

export interface FoodImageData {
  imageFile: string;      // 画像ファイル名（例: "item01.jpg"）
  name: string;          // 食品名（例: "厚揚げ"）
  protein: number;       // タンパク質量（g）（例: 2）
  serving: string;       // 食べる量の目安（例: "1/9"、"1パック"、"大さじ2"）
  weight: string;        // 食品自体の質量（例: "20g"、"100g"、"200ml"）
  category: 'grain' | 'dairy' | 'meat' | 'fish' | 'egg' | 'soy' | 'vegetable' | 'fruit' | 'other';
}

// 画像データを入力してください
// 例: { imageFile: "item00.jpg", name: "厚揚げ", protein: 2, serving: "1/9", weight: "20g", category: "soy" },

export const foodImageDataList: FoodImageData[] = [
  // item01.jpg
  { imageFile: "item01.jpg", name: "厚揚げ", protein: 2, serving: "1切れ", weight: "20g", category: "soy" },
  
  // item02.jpg
  { imageFile: "item02.jpg", name: "ピーナツ", protein: 2, serving: "大きめ10粒", weight: "10g", category: "soy" },
  
  // item03.jpg
  { imageFile: "item03.jpg", name: "煮大豆", protein: 3, serving: "大さじ山盛り1杯", weight: "20g", category: "soy" },
  
  // item04.jpg
  { imageFile: "item04.jpg", name: "豆腐 木綿", protein: 3, serving: "1/6丁", weight: "50g", category: "soy" },
  
  // item05.jpg
  { imageFile: "item05.jpg", name: "豆腐 絹", protein:3, serving: "1/6丁", weight: "50g", category: "soy" },
  
  // item06.jpg
  { imageFile: "item06.jpg", name: "ヨーグルト（無糖）", protein: 3, serving: "1カップ", weight: "100g", category: "dairy" },
  
  // item07.jpg
  { imageFile: "item07.jpg", name: "チーズ", protein: 4, serving: "スライス1枚/6ピース1個", weight: "18g", category: "dairy" },
  
  // item08.jpg
  { imageFile: "item08.jpg", name: "納豆", protein: 4, serving: "1パック", weight: "30g", category: "soy" },
  
  // item09.jpg
  { imageFile: "item09.jpg", name: "牛乳", protein: 5, serving: "コップ1杯", weight: "150g", category: "dairy" },
  
  // item10.jpg
  { imageFile: "item10.jpg", name: "豆乳", protein: 5, serving: "コップ1杯", weight: "150g", category: "dairy" },
  
  // item11.jpg
  { imageFile: "item11.jpg", name: "ししゃも", protein: 2, serving: "1本", weight: "15g", category: "fish" },
  
  // item12.jpg
  { imageFile: "item12.jpg", name: "ツナ缶", protein: 4, serving: "スプーン1杯", weight: "15g", category: "fish" },
  
  // item13.jpg
  { imageFile: "item13.jpg", name: "さば", protein: 4, serving: "1切れ", weight: "20g", category: "fish" },
  
  // item14.jpg
  { imageFile: "item14.jpg", name: "さけ", protein: 5, serving: "1切れ", weight: "20g", category: "fish" },
  
  // item15.jpg
  { imageFile: "item15.jpg", name: "さけフレーク", protein: 6, serving: "スプーン1杯", weight: "25g", category: "fish" },
  
  // item16.jpg
  { imageFile: "item16.jpg", name: "魚肉ソーセージ", protein: 7, serving: "1本", weight: "70g", category: "fish" },
  
  // item17.jpg
  { imageFile: "item17.jpg", name: "白米", protein: 3, serving: "1膳", weight: "150g", category: "grain" },
  
  // item18.jpg
  { imageFile: "item18.jpg", name: "クロワッサン", protein: 3, serving: "1個", weight: "45g", category: "grain" },
  
  // item19.jpg
  { imageFile: "item19.jpg", name: "ドーナツ", protein: 3, serving: "1個", weight: "50g", category: "grain" },
  
  // item20.jpg
  { imageFile: "item20.jpg", name: "コーンフレーク（無糖）", protein: 3, serving: "1食", weight: "50g", category: "grain" },
  
  // item21.jpg
  { imageFile: "item21.jpg", name: "玄米ごはん", protein: 4, serving: "1膳", weight: "150g", category: "grain" },
  
  // item22.jpg
  { imageFile: "item22.jpg", name: "オートミール", protein: 4, serving: "1食", weight: "乾燥30g", category: "grain" },
  
  // item23.jpg
  { imageFile: "item23.jpg", name: "食パン", protein: 4, serving: "1枚", weight: "60g", category: "grain" },
  
  // item24.jpg
  { imageFile: "item24.jpg", name: "レーズンパン", protein: 5, serving: "1枚", weight: "75g", category: "grain" },
  
  // item25.jpg
  { imageFile: "item25.jpg", name: "うどん・そうめん", protein: 5, serving: "1玉", weight: "60g", category: "grain" },
  
  // item26.jpg
  { imageFile: "item26.jpg", name: "メロンパン", protein: 6, serving: "1個", weight: "90g", category: "grain" },
  
  // item27.jpg
  { imageFile: "item27.jpg", name: "あんぱん", protein: 7, serving: "1個", weight: "120g", category: "grain" },
  
  // item28.jpg
  { imageFile: "item28.jpg", name: "ソーセージ", protein: 2, serving: "1本", weight: "20g", category: "meat" },
  
  // item29.jpg
  { imageFile: "item29.jpg", name: "ベーコン", protein: 2, serving: "1枚", weight: "20g", category: "meat" },
  
  // item30.jpg
  { imageFile: "item30.jpg", name: "ハム", protein: 2, serving: "2枚", weight: "20g", category: "meat" },
  
  // item31.jpg
  { imageFile: "item31.jpg", name: "ハンバーグ（ミニサイズ）", protein: 3, serving: "1個", weight: "25g", category: "meat" },
  
  // item32.jpg
  { imageFile: "item32.jpg", name: "鶏むね肉", protein: 5, serving: "1/10枚", weight: "25g", category: "meat" },
  
  // item33.jpg
  { imageFile: "item33.jpg", name: "卵焼き（厚焼き）", protein: 2, serving: "1切れ", weight: "20g", category: "egg" },
  
  // item34.jpg
  { imageFile: "item34.jpg", name: "プリン", protein: 5, serving: "1個", weight: "90g", category: "egg" },
  
  // item35.jpg
  { imageFile: "item35.jpg", name: "卵", protein: 6, serving: "1個", weight: "50g", category: "egg" },
];