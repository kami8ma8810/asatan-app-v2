import { type Component, Show, For } from 'solid-js';
import type { Food } from '../../models/Food';
import { ShareButton } from '../ShareButton';
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
    <div class={`${styles.sidebar} ${props.isMobile ? styles.mobile : ''} ${props.isExpanded ? styles.expanded : ''} ${isAchieved() ? styles.mobileAchieved : ''}`}>
      {/* モバイル用フローティングカウンター */}
      <Show when={props.isMobile}>
        <button 
          class={`${styles.mobileHandle} ${isAchieved() ? styles.achieved : ''}`}
          onClick={props.onToggleExpand}
          aria-label="選択中の食品を表示"
        >
          <div class={styles.handleSummary}>
            <Show when={!isAchieved()}>
              <div class={styles.handleProtein}>
                {props.totalProtein.toFixed(1)}
                <span style="font-size: 0.75em; font-weight: normal;">g</span>
              </div>
              <span class={styles.handleCount}>あと{remaining()}g</span>
            </Show>
            <Show when={isAchieved()}>
              <div class={styles.achievedIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <div class={styles.handleProtein}>
                {props.totalProtein.toFixed(1)}g 達成！
              </div>
            </Show>
          </div>
          <div class={`${styles.handleToggle} ${props.isExpanded ? styles.expanded : ''}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
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
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                          <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"/>
                        </svg>
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

        {/* シェアボタン（デスクトップのみ） */}
        <Show when={!props.isMobile}>
          <div class={styles.shareSection}>
            <ShareButton 
              selectedFoods={props.selectedFoods}
              targetProtein={props.targetProtein || 20}
              generateImage={true}
              useWebShareApi={true}
            />
          </div>
        </Show>
      </div>
    </div>
  );
};