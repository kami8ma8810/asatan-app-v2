import { describe, it, expect } from "vitest";
import { render, cleanup } from "@solidjs/testing-library";
import { ProteinCounter } from "./ProteinCounter";

describe("ProteinCounter", () => {
  afterEach(() => {
    cleanup();
  });

  it("合計タンパク質量を表示する", () => {
    const { getByText } = render(() => 
      <ProteinCounter total={15} />
    );
    expect(getByText("現在のタンパク質: 15g")).toBeDefined();
  });

  it("20g達成時に視覚的フィードバックを表示", () => {
    const { container, getByText } = render(() => 
      <ProteinCounter total={20} />
    );
    
    expect(container.querySelector(".achieved")).toBeDefined();
    expect(getByText("🎉 目標達成！")).toBeDefined();
  });

  it("プログレスバーを正しく表示する", () => {
    const { getByRole } = render(() => 
      <ProteinCounter total={10} />
    );
    
    const progressBar = getByRole("progressbar") as HTMLElement;
    expect(progressBar.getAttribute("aria-valuenow")).toBe("10");
    expect(progressBar.getAttribute("aria-valuemax")).toBe("20");
    
    const progressFill = progressBar.querySelector(".progress-fill") as HTMLElement;
    expect(progressFill.style.width).toBe("50%");
  });

  it("0gの場合", () => {
    const { getByText, getByRole } = render(() => 
      <ProteinCounter total={0} />
    );
    
    expect(getByText("現在のタンパク質: 0g")).toBeDefined();
    const progressBar = getByRole("progressbar") as HTMLElement;
    const progressFill = progressBar.querySelector(".progress-fill") as HTMLElement;
    expect(progressFill.style.width).toBe("0%");
  });

  it("20gを超えた場合", () => {
    const { getByText, getByRole } = render(() => 
      <ProteinCounter total={25} />
    );
    
    expect(getByText("現在のタンパク質: 25g")).toBeDefined();
    expect(getByText("🎉 目標達成！")).toBeDefined();
    
    const progressBar = getByRole("progressbar") as HTMLElement;
    const progressFill = progressBar.querySelector(".progress-fill") as HTMLElement;
    expect(progressFill.style.width).toBe("125%");
  });

  it("目標までの残り量を表示する", () => {
    const { getByText } = render(() => 
      <ProteinCounter total={15} />
    );
    
    expect(getByText("あと5g")).toBeDefined();
  });

  it("目標達成後は残り量を表示しない", () => {
    const { queryByText } = render(() => 
      <ProteinCounter total={20} />
    );
    
    expect(queryByText(/あと\d+g/)).toBeNull();
  });
});