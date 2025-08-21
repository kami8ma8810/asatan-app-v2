export interface Food {
  id: string;
  name: string;
  protein: number;
  imageUrl: string;
  unit?: string;
  category?: 'grain' | 'dairy' | 'meat' | 'fish' | 'egg' | 'soy' | 'vegetable' | 'fruit' | 'other';
}

let idCounter = 0;

export function createFood(
  name: string,
  protein: number,
  imageFileName: string,
  unit?: string,
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
    unit,
    category,
  };
}