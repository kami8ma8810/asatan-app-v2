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
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="12" fill="#4CAF50" />
              <path
                d="M8 12.5L10.5 15L16 9"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </Show>
      </div>
      <div class="food-card__info">
        <h3 class="food-card__name">{props.food.name}</h3>
        <p class="food-card__protein">{props.food.protein}g</p>
      </div>
    </button>
  );
};