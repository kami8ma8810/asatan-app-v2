import { type Component, Show } from "solid-js";
import type { Food } from "../models/Food";
import "./FoodCard.css";

interface FoodCardProps {
  food: Food;
  selected: boolean;
  onToggle: (food: Food) => void;
}

export const FoodCard: Component<FoodCardProps> = (props) => {
  const handleClick = () => {
    props.onToggle(props.food);
  };

  return (
    <button
      class={`food-card ${props.selected ? "selected" : ""}`}
      onClick={handleClick}
      role="button"
      aria-pressed={props.selected}
      aria-label={`${props.food.name} - ${props.food.protein}g`}
    >
      <div class="food-card__image-container">
        <img
          src={props.food.imageUrl}
          alt={props.food.name}
          class="food-card__image"
          role="img"
          loading="lazy"
        />
        <Show when={props.selected}>
          <div class="food-card__check" data-testid="check-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="16" cy="16" r="16" fill="#4CAF50" />
              <path
                d="M10 16L14 20L22 12"
                stroke="white"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </Show>
      </div>
      <div class="food-card__info">
        <h3 class="food-card__name">{props.food.name}</h3>
        <div class="food-card__details">
          <span class="food-card__protein">{props.food.protein}g</span>
          <Show when={props.food.serving}>
            <span class="food-card__serving">{props.food.serving}</span>
          </Show>
          <Show when={props.food.weight}>
            <span class="food-card__weight">{props.food.weight}</span>
          </Show>
        </div>
      </div>
    </button>
  );
};