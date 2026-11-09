import type { Exercise } from "../../../types";
import "./math.css";
const places = [
  { value: 1000, label: "Tausender", color: "violet" },
  { value: 100, label: "Hunderter", color: "cyan" },
  { value: 10, label: "Zehner", color: "amber" },
  { value: 1, label: "Einer", color: "rose" },
];
export function PlaceValueQuestion({
  visual,
}: {
  visual: NonNullable<Exercise["visual"]>;
}) {
  return (
    <div className="question-place-values" aria-label="Stellenwerttafel">
      {places.map((place) => (
        <div
          className={`${place.color} ${visual.highlightPlace === place.value ? "question-highlight" : ""}`}
          key={place.value}
        >
          <span>{place.label}</span>
          <strong>{Math.floor(visual.number / place.value) % 10}</strong>
        </div>
      ))}
    </div>
  );
}
