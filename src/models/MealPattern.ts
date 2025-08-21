import { Food } from './Food';

export interface MealPattern {
  id: string;
  name: string;
  description: string;
  foods: Food[];
  totalProtein: number;
  category: 'japanese' | 'western' | 'yogurt' | 'light' | 'balanced';
  icon?: string;
}

export type MealPatternSelection = {
  patternId: string;
  isSelected: boolean;
};