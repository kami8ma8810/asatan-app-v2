import { type Component, createMemo, Show } from "solid-js";
import "./ProteinCounter.css";

interface ProteinCounterProps {
  total: number;
}

const GOAL_PROTEIN = 20;

export const ProteinCounter: Component<ProteinCounterProps> = (props) => {
  const isAchieved = createMemo(() => props.total >= GOAL_PROTEIN);
  const remaining = createMemo(() => Math.max(0, GOAL_PROTEIN - props.total));
  const progressPercentage = createMemo(() => 
    Math.min(150, Math.round((props.total / GOAL_PROTEIN) * 100))
  );

  return (
    <div class={`protein-counter ${isAchieved() ? "achieved counter-achieved" : ""}`}>
      <div class="protein-counter__header">
        <h2 class="protein-counter__title">
          現在のタンパク質: <span class="counter-total">{props.total.toFixed(1)}g</span>
        </h2>
        <Show when={isAchieved()}>
          <span class="protein-counter__achievement">🎉 目標達成！</span>
        </Show>
        <Show when={!isAchieved() && remaining() > 0}>
          <span class="protein-counter__remaining">あと{remaining()}g</span>
        </Show>
      </div>
      
      <div 
        class="protein-counter__progress"
        role="progressbar"
        aria-valuenow={props.total}
        aria-valuemin={0}
        aria-valuemax={GOAL_PROTEIN}
        aria-label={`タンパク質進捗: ${props.total}g / ${GOAL_PROTEIN}g`}
      >
        <div 
          class="progress-fill"
          style={{
            width: `${progressPercentage()}%`,
            "background-color": isAchieved() ? "#4CAF50" : "#FFC107"
          }}
        />
        <div class="progress-label">
          {props.total} / {GOAL_PROTEIN}g
        </div>
      </div>

      <Show when={isAchieved()}>
        <div class="protein-counter__celebration">
          <p class="celebration-message">
            素晴らしい！朝のタンパク質目標を達成しました！
          </p>
        </div>
      </Show>
    </div>
  );
};