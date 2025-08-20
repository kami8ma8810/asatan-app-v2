export interface Food {
  id: string;
  name: string;
  protein: number;
  imageUrl: string;
}

let idCounter = 0;

export function createFood(
  name: string,
  protein: number,
  imageFileName: string
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
  };
}