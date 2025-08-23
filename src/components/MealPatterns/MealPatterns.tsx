import { Component, createSignal, createEffect, For, Show } from 'solid-js';
import { MealPatternsService } from '../../services/MealPatternsService';
import type { MealPattern } from '../../types/MealPattern';
import styles from './MealPatterns.module.css';

interface MealPatternsProps {
  onSelect: (pattern: MealPattern) => void;
}

const categoryLabels: Record<string, string> = {
  single: '単品',
  japanese: '和食',
  western: '洋食',
  balanced: 'バランス',
  healthy: 'ヘルシー',
  high_protein: '高タンパク',
  pfc_optimized: 'PFC最適',
};

export const MealPatterns: Component<MealPatternsProps> = (props) => {
  const [patterns, setPatterns] = createSignal<MealPattern[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [selectedCategory, setSelectedCategory] = createSignal<string | undefined>();
  const [sortByPopular, setSortByPopular] = createSignal(false);

  const fetchPatterns = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await MealPatternsService.fetchPatterns({
        category: selectedCategory(),
        popular: sortByPopular(),
      });
      setPatterns(response.patterns);
    } catch (err) {
      setError('エラーが発生しました');
      console.error('Failed to fetch patterns:', err);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    fetchPatterns();
  });

  const handleCategoryFilter = (category: string | undefined) => {
    setSelectedCategory(category);
    fetchPatterns();
  };

  const handleSortToggle = () => {
    setSortByPopular(!sortByPopular());
    fetchPatterns();
  };

  return (
    <div class={styles.container}>
      <h2>献立パターン</h2>

      <div class={styles.filters}>
        <div class={styles.categoryFilters}>
          <button
            class={selectedCategory() === undefined ? styles.active : ''}
            onClick={() => handleCategoryFilter(undefined)}
          >
            すべて
          </button>
          <For each={Object.entries(categoryLabels)}>
            {([value, label]) => (
              <button
                class={selectedCategory() === value ? styles.active : ''}
                onClick={() => handleCategoryFilter(value)}
                role="button"
                aria-label={label}
              >
                {label}
              </button>
            )}
          </For>
        </div>

        <div class={styles.sortOptions}>
          <button onClick={handleSortToggle} role="button" aria-label={sortByPopular() ? '人気順' : 'タンパク質順'}>
            {sortByPopular() ? '人気順' : 'タンパク質順'}
          </button>
        </div>
      </div>

      <Show when={loading()}>
        <div class={styles.loading}>読み込み中...</div>
      </Show>

      <Show when={error()}>
        <div class={styles.error}>エラーが発生しました</div>
      </Show>

      <Show when={!loading() && !error()}>
        <div class={styles.patterns}>
          <For each={patterns()}>
            {(pattern) => (
              <div class={styles.patternCard}>
                <div class={styles.header}>
                  <div class={styles.info}>
                    <h3 class={styles.name}>{pattern.name}</h3>
                    <span class={styles.categoryBadge}>
                      {categoryLabels[pattern.category]}
                    </span>
                  </div>
                  <div class={styles.protein}>
                    <span class={styles.proteinValue}>{pattern.total_protein.toFixed(1)}g</span>
                    <span class={styles.proteinLabel}>タンパク質</span>
                  </div>
                </div>

                <p class={styles.description}>{pattern.description}</p>

                <div class={styles.stats}>
                  <div class={styles.stat}>
                    <span class={styles.statLabel}>カロリー</span>
                    <span class={styles.statValue}>{pattern.total_energy}kcal</span>
                  </div>
                  <Show when={pattern.pfc_score > 0}>
                    <div class={styles.stat}>
                      <span class={styles.statLabel}>PFCスコア</span>
                      <span class={styles.statValue}>{pattern.pfc_score.toFixed(0)}点</span>
                    </div>
                  </Show>
                </div>

                <div class={styles.foods}>
                  <h4>含まれる食品</h4>
                  <For each={pattern.foods}>
                    {(food) => (
                      <div class={styles.foodItem}>
                        <span class={styles.foodName}>{food.food_name}</span>
                        <span class={styles.foodProtein}>({food.food_protein.toFixed(1)}g)</span>
                      </div>
                    )}
                  </For>
                </div>

                <button
                  class={styles.selectButton}
                  onClick={() => props.onSelect(pattern)}
                  role="button"
                  aria-label="選択"
                >
                  選択
                </button>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};