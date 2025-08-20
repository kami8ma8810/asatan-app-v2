import { describe, it, expect, beforeEach } from "vitest";
import { render, fireEvent, cleanup } from "@solidjs/testing-library";
import App from "./App";

describe("App Integration", () => {
  beforeEach(() => {
    cleanup();
  });

  it("初期状態で0gと表示される", () => {
    const { getByText } = render(() => <App />);
    expect(getByText("現在のタンパク質: 0g")).toBeDefined();
  });

  it("食品を選択するとタンパク質が加算される", async () => {
    const { getByText, getByLabelText } = render(() => <App />);
    
    // 納豆(4g)を選択
    const nattoCard = getByLabelText(/納豆.*4g/);
    fireEvent.click(nattoCard);
    
    expect(getByText("現在のタンパク質: 4g")).toBeDefined();
  });

  it("複数の食品を選択して合計が計算される", async () => {
    const { getByText, getByLabelText } = render(() => <App />);
    
    // 納豆(4g)を選択
    fireEvent.click(getByLabelText(/納豆.*4g/));
    
    // 卵(6g)を選択
    fireEvent.click(getByLabelText(/卵.*6g/));
    
    // 牛乳(5g)を選択
    fireEvent.click(getByLabelText(/牛乳.*5g/));
    
    expect(getByText("現在のタンパク質: 15g")).toBeDefined();
  });

  it("選択を解除するとタンパク質が減算される", async () => {
    const { getByText, getByLabelText } = render(() => <App />);
    
    // 納豆(4g)を選択
    const nattoCard = getByLabelText(/納豆.*4g/);
    fireEvent.click(nattoCard);
    expect(getByText("現在のタンパク質: 4g")).toBeDefined();
    
    // 納豆を選択解除
    fireEvent.click(nattoCard);
    expect(getByText("現在のタンパク質: 0g")).toBeDefined();
  });

  it("20g達成すると達成メッセージが表示される", async () => {
    const { getByText, getByLabelText, container } = render(() => <App />);
    
    // 複数選択して20g以上にする
    fireEvent.click(getByLabelText(/卵.*6g/));        // 6g
    fireEvent.click(getByLabelText(/鶏むね肉.*5g/));   // +5g = 11g
    fireEvent.click(getByLabelText(/牛乳.*5g/));      // +5g = 16g
    fireEvent.click(getByLabelText(/納豆.*4g/));      // +4g = 20g
    
    expect(getByText("🎉 目標達成！")).toBeDefined();
    expect(container.querySelector(".achieved")).toBeDefined();
  });

  it("カテゴリー別に食品が表示される", () => {
    const { getByText } = render(() => <App />);
    
    // カテゴリータイトルが表示されているか確認
    expect(getByText("豆類・大豆製品")).toBeDefined();
    expect(getByText("乳製品")).toBeDefined();
    expect(getByText("魚介類")).toBeDefined();
    expect(getByText("穀物・パン類")).toBeDefined();
    expect(getByText("肉類・加工品")).toBeDefined();
    expect(getByText("卵類")).toBeDefined();
  });

  it("全36品目が表示される", () => {
    const { getAllByRole } = render(() => <App />);
    
    const foodCards = getAllByRole("button");
    // カテゴリーヘッダーのボタンなどを除いた食品カードの数
    const foodCardCount = foodCards.filter(card => 
      card.getAttribute("aria-label")?.includes("g")
    ).length;
    
    expect(foodCardCount).toBe(36);
  });
});