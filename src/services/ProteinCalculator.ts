import type { Food } from "../models/Food";

export class ProteinCalculator {
  private readonly GOAL_PROTEIN = 20;

  /**
   * 食品リストのタンパク質を合計する
   */
  calculate(foods: Food[]): number {
    return foods.reduce((sum, food) => sum + food.protein, 0);
  }

  /**
   * 目標タンパク質量を達成したか判定する
   */
  isGoalAchieved(currentProtein: number): boolean {
    return currentProtein >= this.GOAL_PROTEIN;
  }

  /**
   * 目標までの不足分を計算する
   */
  getRemainingToGoal(currentProtein: number): number {
    const remaining = this.GOAL_PROTEIN - currentProtein;
    return Math.max(0, remaining);
  }

  /**
   * 達成率をパーセンテージで計算する
   */
  getProgressPercentage(currentProtein: number): number {
    return Math.round((currentProtein / this.GOAL_PROTEIN) * 100);
  }

  /**
   * 目標タンパク質量を取得する
   */
  getGoalAmount(): number {
    return this.GOAL_PROTEIN;
  }
}