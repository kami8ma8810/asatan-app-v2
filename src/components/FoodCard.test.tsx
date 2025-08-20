import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@solidjs/testing-library";
import { FoodCard } from "./FoodCard";
import { createFood } from "../models/Food";

describe("FoodCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("食品情報を表示する", () => {
    const food = createFood("納豆", 4, "item13.jpg");
    const { getByText, getByRole } = render(() => 
      <FoodCard food={food} selected={false} onToggle={() => {}} />
    );
    
    expect(getByText("納豆")).toBeDefined();
    expect(getByText("4g")).toBeDefined();
    const img = getByRole("img") as HTMLImageElement;
    expect(img.src).toContain("/assets/images/item13.jpg");
  });

  it("クリックでonToggleが呼ばれる", async () => {
    const onToggle = vi.fn();
    const food = createFood("納豆", 4, "item13.jpg");
    const { getByRole } = render(() => 
      <FoodCard food={food} selected={false} onToggle={onToggle} />
    );
    
    const card = getByRole("button");
    fireEvent.click(card);
    
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(food);
  });

  it("選択状態でselectedクラスが付与される", () => {
    const food = createFood("納豆", 4, "item13.jpg");
    const { container, rerender } = render(() => 
      <FoodCard food={food} selected={false} onToggle={() => {}} />
    );
    
    expect(container.querySelector(".selected")).toBeNull();
    
    // 選択状態に変更
    cleanup();
    const { container: selectedContainer } = render(() => 
      <FoodCard food={food} selected={true} onToggle={() => {}} />
    );
    
    expect(selectedContainer.querySelector(".selected")).toBeDefined();
  });

  it("選択状態でチェックマークが表示される", () => {
    const food = createFood("納豆", 4, "item13.jpg");
    const { queryByTestId, rerender } = render(() => 
      <FoodCard food={food} selected={false} onToggle={() => {}} />
    );
    
    expect(queryByTestId("check-icon")).toBeNull();
    
    cleanup();
    const { getByTestId } = render(() => 
      <FoodCard food={food} selected={true} onToggle={() => {}} />
    );
    
    expect(getByTestId("check-icon")).toBeDefined();
  });
});