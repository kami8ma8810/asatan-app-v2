import { describe, it, expect } from "bun:test";
import { ProteinCalculator } from "./ProteinCalculator";
import { createFood } from "../models/Food";

describe("ProteinCalculator", () => {
  it("選択された食品のタンパク質を合計する", () => {
    const foods = [
      createFood("納豆", 4, "item13.jpg"),
      createFood("卵", 6, "item35.jpg"),
      createFood("牛乳", 5, "item09.jpg"),
    ];
    
    const calculator = new ProteinCalculator();
    expect(calculator.calculate(foods)).toBe(15);
  });

  it("空の配列の場合は0を返す", () => {
    const calculator = new ProteinCalculator();
    expect(calculator.calculate([])).toBe(0);
  });

  it("20g達成を判定する", () => {
    const calculator = new ProteinCalculator();
    
    expect(calculator.isGoalAchieved(19)).toBe(false);
    expect(calculator.isGoalAchieved(20)).toBe(true);
    expect(calculator.isGoalAchieved(21)).toBe(true);
  });

  it("目標までの不足分を計算する", () => {
    const calculator = new ProteinCalculator();
    
    expect(calculator.getRemainingToGoal(0)).toBe(20);
    expect(calculator.getRemainingToGoal(10)).toBe(10);
    expect(calculator.getRemainingToGoal(15)).toBe(5);
    expect(calculator.getRemainingToGoal(20)).toBe(0);
    expect(calculator.getRemainingToGoal(25)).toBe(0); // 超過した場合は0
  });

  it("達成率を計算する", () => {
    const calculator = new ProteinCalculator();
    
    expect(calculator.getProgressPercentage(0)).toBe(0);
    expect(calculator.getProgressPercentage(10)).toBe(50);
    expect(calculator.getProgressPercentage(20)).toBe(100);
    expect(calculator.getProgressPercentage(30)).toBe(150); // 100%を超えることも可能
  });
});