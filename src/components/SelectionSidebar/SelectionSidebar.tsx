import { type Component, Show, For } from 'solid-js';
import type { Food } from '../../models/Food';
import styles from './SelectionSidebar.module.css';

interface SelectionSidebarProps {
  selectedFoods: Food[];
  totalProtein: number;
  targetProtein?: number;
  onRemoveFood?: (food: Food) => void;
  isMobile?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const SelectionSidebar: Component<SelectionSidebarProps> = (props) => {
  const isAchieved = () => props.targetProtein ? props.totalProtein >= props.targetProtein : false;
  const remaining = () => Math.max(0, (props.targetProtein || 20) - props.totalProtein);
  const progressPercentage = () => 
    Math.min(150, Math.round((props.totalProtein / (props.targetProtein || 20)) * 100));

  return (
    <div class={`${styles.sidebar} ${props.isMobile ? styles.mobile : ''} ${props.isExpanded ? styles.expanded : ''}`}>
      {/* モバイル用ハンドル */}
      <Show when={props.isMobile}>
        <button 
          class={styles.mobileHandle}
          onClick={props.onToggleExpand}
          aria-label="選択中の食品を表示"
        >
          <div class={styles.handleBar} />
          <div class={styles.handleSummary}>
            <span class={styles.handleProtein}>{props.totalProtein.toFixed(1)}g</span>
            <span class={styles.handleCount}>({props.selectedFoods.length}品)</span>
          </div>
        </button>
      </Show>

      <div class={styles.content}>
        {/* タンパク質カウンター */}
        <div class={`${styles.proteinSection} ${isAchieved() ? styles.achieved : ''}`}>
          <h3 class={styles.sectionTitle}>現在のタンパク質</h3>
          
          <div class={styles.proteinDisplay}>
            <div class={styles.proteinValue}>
              {props.totalProtein.toFixed(1)}
              <span class={styles.proteinUnit}>g</span>
            </div>
            
            <Show when={!isAchieved()}>
              <div class={styles.remaining}>
                あと {remaining()}g
              </div>
            </Show>
            
            <Show when={isAchieved()}>
              <div class={styles.achievedBadge}>
                目標達成！
              </div>
            </Show>
          </div>

          {/* プログレスバー */}
          <div class={styles.progressContainer}>
            <div 
              class={styles.progressBar}
              style={{ width: `${progressPercentage()}%` }}
            />
            <div class={styles.progressLabel}>
              {props.totalProtein.toFixed(1)} / {props.targetProtein || 20}g
            </div>
          </div>
        </div>

        {/* 選択中の食品 */}
        <div class={styles.selectedSection}>
          <h3 class={styles.sectionTitle}>
            選択中の食品 ({props.selectedFoods.length})
          </h3>
          
          <Show when={props.selectedFoods.length === 0}>
            <p class={styles.emptyMessage}>
              食品を選択してください
            </p>
          </Show>

          <Show when={props.selectedFoods.length > 0}>
            <div class={styles.selectedList}>
              <For each={props.selectedFoods}>
                {(food) => (
                  <div class={styles.selectedItem}>
                    <div class={styles.itemInfo}>
                      <span class={styles.itemName}>{food.name}</span>
                      <span class={styles.itemProtein}>{food.protein}g</span>
                    </div>
                    <Show when={props.onRemoveFood}>
                      <button
                        class={styles.removeButton}
                        onClick={() => props.onRemoveFood?.(food)}
                        aria-label={`${food.name}を削除`}
                      >
                        ×
                      </button>
                    </Show>
                  </div>
                )}
              </For>
            </div>

            {/* 合計サマリー */}
            <div class={styles.summary}>
              <div class={styles.summaryRow}>
                <span>合計</span>
                <span class={styles.summaryValue}>
                  {props.totalProtein.toFixed(1)}g
                </span>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
};