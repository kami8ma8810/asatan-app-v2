export interface MealPatternFood {
  food_id: string;
  quantity: number;
  serving_size?: string;
  food_name: string;
  food_protein: number;
}

export interface MealPattern {
  id: string;
  name: string;
  description: string;
  total_protein: number;
  total_energy: number;
  total_fat: number;
  total_carbs: number;
  pfc_score: number;
  category: 'single' | 'japanese' | 'western' | 'balanced' | 'healthy' | 'high_protein' | 'pfc_optimized';
  tags?: string;
  icon?: string;
  popularity: number;
  is_auto_generated: number;
  main_food_id?: string;
  created_at: string;
  updated_at: string;
  foods: MealPatternFood[];
}

export interface MealPatternsResponse {
  patterns: MealPattern[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}