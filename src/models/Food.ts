export interface Food {
  id: string;
  name: string;
  protein: number;  // タンパク質量（g）
  imageUrl: string;
  serving?: string;  // 食べる量の目安（例：1/9、1パック、大さじ2）
  weight?: string;   // 食品自体の質量（例：20g、100g、200ml）
  unit?: string;     // 単位（旧互換性のため残す）
  category?: 'grain' | 'dairy' | 'meat' | 'fish' | 'egg' | 'soy' | 'vegetable' | 'fruit' | 'other';
}

let idCounter = 0;

export function createFood(
  name: string,
  protein: number,
  imageFileName: string,
  serving?: string,
  weight?: string,
  category?: Food['category']
): Food {
  const id = `food-${Date.now()}-${++idCounter}`;
  
  // imageUrlにパスが含まれているか確認
  const imageUrl = imageFileName.startsWith("/")
    ? imageFileName
    : `/assets/images/${imageFileName}`;
  
  return {
    id,
    name,
    protein,
    imageUrl,
    serving,
    weight,
    unit: serving, // 旧互換性のため
    category,
  };
}