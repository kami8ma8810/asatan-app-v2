import { describe, it, expect } from "bun:test";
import { createFood, type Food } from "./Food";

describe("Food model", () => {
  it("食品データを正しく作成できる", () => {
    const food = createFood("納豆", 4, "item13.jpg");
    
    expect(food.id).toBeDefined();
    expect(food.name).toBe("納豆");
    expect(food.protein).toBe(4);
    expect(food.imageUrl).toBe("/assets/images/item13.jpg");
  });

  it("IDは一意である", () => {
    const food1 = createFood("納豆", 4, "item13.jpg");
    const food2 = createFood("卵", 6, "item35.jpg");
    
    expect(food1.id).not.toBe(food2.id);
  });

  it("imageUrlにパスが含まれない場合は自動でパスを追加", () => {
    const food = createFood("納豆", 4, "item13.jpg");
    expect(food.imageUrl).toBe("/assets/images/item13.jpg");
  });

  it("imageUrlに既にパスが含まれる場合はそのまま使用", () => {
    const food = createFood("納豆", 4, "/custom/path/item13.jpg");
    expect(food.imageUrl).toBe("/custom/path/item13.jpg");
  });
});