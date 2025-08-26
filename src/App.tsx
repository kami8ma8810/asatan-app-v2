import { type Component, createSignal, For, Show, createEffect } from "solid-js";
import { FoodCard } from "./components/FoodCard";
import { ShareButton } from "./components/ShareButton";
import { SelectionSidebar } from "./components/SelectionSidebar";
import { foodsData, foodCategories, getFoodsByCategory } from "./data/foods";
import { ProteinCalculator } from "./services/ProteinCalculator";
import type { Food } from "./models/Food";
import "./App.css";

const App: Component = () => {
  const [selectedFoods, setSelectedFoods] = createSignal<Set<string>>(new Set());
  const [isMobileExpanded, setIsMobileExpanded] = createSignal(false);
  const [isMobile, setIsMobile] = createSignal(false);
  const calculator = new ProteinCalculator();

  // レスポンシブ判定
  createEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });

  const getSelectedFoodsList = () => {
    return foodsData.filter(food => selectedFoods().has(food.id));
  };

  const totalProtein = () => {
    return calculator.calculate(getSelectedFoodsList());
  };

  const handleToggle = (food: Food) => {
    const newSelected = new Set(selectedFoods());
    if (newSelected.has(food.id)) {
      newSelected.delete(food.id);
    } else {
      newSelected.add(food.id);
    }
    setSelectedFoods(newSelected);
  };

  const handleRemoveFood = (food: Food) => {
    const newSelected = new Set(selectedFoods());
    newSelected.delete(food.id);
    setSelectedFoods(newSelected);
  };

  return (
    <div class="app">
      <header class="app-header">
        <h1 class="app-title">朝たん計算アプリ</h1>
        <p class="app-subtitle">朝食のタンパク質20gを目指そう！</p>
      </header>

      <div class="app-layout">
        {/* デスクトップ用サイドバー / モバイル用ボトムシート */}
        <SelectionSidebar
          selectedFoods={getSelectedFoodsList()}
          totalProtein={totalProtein()}
          targetProtein={20}
          onRemoveFood={handleRemoveFood}
          isMobile={isMobile()}
          isExpanded={isMobileExpanded()}
          onToggleExpand={() => setIsMobileExpanded(!isMobileExpanded())}
        />

        <main class="app-main">
          {/* モバイルのみシェアボタンを上部に配置 */}
          <Show when={isMobile()}>
            <div class="app-actions">
              <ShareButton 
                selectedFoods={getSelectedFoodsList()}
              />
            </div>
          </Show>

          <div class="app-foods">
            <For each={foodCategories}>
              {(category) => (
                <section class="food-category">
                  <h2 class="category-title">{category}</h2>
                  <div class="food-grid">
                    <For each={getFoodsByCategory(category)}>
                      {(food) => (
                        <FoodCard
                          food={food}
                          selected={selectedFoods().has(food.id)}
                          onToggle={handleToggle}
                        />
                      )}
                    </For>
                  </div>
                </section>
              )}
            </For>
          </div>
        </main>
      </div>

      <footer class="app-footer">
        <p>© 2024 朝たん計算アプリ v2.0 - Powered by Solid.js</p>
        <p class="footer-reference">
          参考文献：
          <a 
            href="https://www9.nhk.or.jp/gatten/articles/20211117/index.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            NHKガッテン！筋肉増強☆魔法の言葉
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;