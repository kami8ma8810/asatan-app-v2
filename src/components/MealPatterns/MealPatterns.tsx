import { Component, For, createSignal } from 'solid-js';
import { MealPattern } from '../../models/MealPattern';
import styles from './MealPatterns.module.css';

interface MealPatternsProps {
  patterns: MealPattern[];
  selectedPatternIds?: string[];
  onSelectPattern: (pattern: MealPattern) => void;
}

export const MealPatterns: Component<MealPatternsProps> = (props) => {
  const isSelected = (patternId: string) => {
    return props.selectedPatternIds?.includes(patternId) || false;
  };

  return (
    <div class={styles.container}>
      {props.patterns.length === 0 ? (
        <div class={styles.empty}>献立パターンがありません</div>
      ) : (
        <div class={styles.patterns}>
          <For each={props.patterns}>
            {(pattern) => (
              <div
                data-testid={`pattern-${pattern.id}`}
                class={`${styles.patternCard} ${isSelected(pattern.id) ? 'selected' : ''}`}
                classList={{ [styles.selected]: isSelected(pattern.id) }}
                onClick={() => props.onSelectPattern(pattern)}
              >
                <div class={styles.header}>
                  <span class={styles.icon}>{pattern.icon}</span>
                  <div class={styles.info}>
                    <h3 class={styles.name}>{pattern.name}</h3>
                    <p class={styles.description}>{pattern.description}</p>
                  </div>
                  <div class={styles.protein}>
                    <span class={styles.proteinValue}>{pattern.totalProtein}g</span>
                    <span class={styles.proteinLabel}>タンパク質</span>
                  </div>
                </div>
                <div class={styles.foods}>
                  <For each={pattern.foods}>
                    {(food) => (
                      <div class={styles.foodItem}>
                        <span class={styles.foodName}>{food.name}</span>
                        <span class={styles.foodProtein}>({food.protein}g)</span>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      )}
    </div>
  );
};