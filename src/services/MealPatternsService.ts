import type { MealPatternsResponse } from '../types/MealPattern';

const API_BASE_URL = 'http://localhost:3001/api';

export interface FetchMealPatternsOptions {
  category?: string;
  foodId?: string;
  limit?: number;
  offset?: number;
  popular?: boolean;
}

export class MealPatternsService {
  static async fetchPatterns(options: FetchMealPatternsOptions = {}): Promise<MealPatternsResponse> {
    const params = new URLSearchParams();
    
    if (options.category) params.append('category', options.category);
    if (options.foodId) params.append('food_id', options.foodId);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.popular) params.append('popular', 'true');
    
    const url = `${API_BASE_URL}/meals/patterns${params.toString() ? '?' + params.toString() : ''}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch meal patterns: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching meal patterns:', error);
      throw error;
    }
  }
  
  static async generatePattern(targetProtein: number = 20): Promise<MealPatternsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/meals/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetProtein }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate meal pattern: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating meal pattern:', error);
      throw error;
    }
  }
}