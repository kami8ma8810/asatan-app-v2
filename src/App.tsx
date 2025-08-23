import { type Component, createSignal, For, Show } from "solid-js";
import { FoodCard } from "./components/FoodCard";
import { ProteinCounter } from "./components/ProteinCounter";
import { ShareButton } from "./components/ShareButton";
import { foodsData, foodCategories, getFoodsByCategory } from "./data/foods";
import { ProteinCalculator } from "./services/ProteinCalculator";
import type { Food } from "./models/Food";
import "./App.css";

const App: Component = () => {
  const [selectedFoods, setSelectedFoods] = createSignal<Set<string>>(new Set());
  const calculator = new ProteinCalculator();

  const totalProtein = () => {
    const selected = foodsData.filter(food => 
      selectedFoods().has(food.id)
    );
    return calculator.calculate(selected);
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

  return (
    <div class="app">
      <header class="app-header">
        <h1 class="app-title">朝たん計算アプリ</h1>
        <p class="app-subtitle">朝食のタンパク質20gを目指そう！</p>
      </header>

      <main class="app-main">
        <div class="app-counter-container">
          <ProteinCounter total={totalProtein()} />
          <div class="app-share-button">
            <ShareButton 
              selectedFoods={foodsData.filter(food => selectedFoods().has(food.id))}
              targetProtein={20}
              generateImage={true}
              useWebShareApi={true}
            />
          </div>
        </div>

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

        <Show when={selectedFoods().size > 0}>
          <div class="selected-foods">
            <h3 class="selected-foods-title">選択中の食品</h3>
            <div class="selected-foods-list">
              <For each={foodsData.filter(f => selectedFoods().has(f.id))}>
                {(food) => (
                  <span class="selected-food-item">
                    {food.name} ({food.protein}g)
                  </span>
                )}
              </For>
            </div>
          </div>
        </Show>
      </main>

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