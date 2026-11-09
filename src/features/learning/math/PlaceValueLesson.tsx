import { useState } from "react";
import { Check, Minus, Plus, RotateCcw } from "lucide-react";
import type { PlaceValueActivity } from "../../../types";
import "./math.css";
const places = [
  { value: 1000, label: "Tausender", short: "T", color: "violet" },
  { value: 100, label: "Hunderter", short: "H", color: "cyan" },
  { value: 10, label: "Zehner", short: "Z", color: "amber" },
  { value: 1, label: "Einer", short: "E", color: "rose" },
] as const;
const numberLabel = (number: number) =>
  new Intl.NumberFormat("de-DE").format(number);
export function PlaceValueLesson({
  activity,
}: {
  activity: PlaceValueActivity;
}) {
  const [number, setNumber] = useState(activity.initialNumber);
  const [selected, setSelected] = useState(100);
  const [target, setTarget] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const selectedPlace = places.find((place) => place.value === selected)!;
  const selectedDigit = Math.floor(number / selected) % 10;
  function updateDigit(place: number, delta: number) {
    const digit = Math.floor(number / place) % 10;
    if (digit + delta < 0 || digit + delta > 9) return;
    setNumber((current) => current + delta * place);
    setSelected(place);
    setFeedback(null);
  }
  return (
    <section className="math-lab" aria-label="Stellenwerte zum Anfassen">
      <div className="math-lab-heading">
        <div>
          <span className="math-topic">T · H · Z · E</span>
          <h2>{activity.title}</h2>
        </div>
        <button
          className="math-reset"
          aria-label="Zahl zurücksetzen"
          onClick={() => {
            setNumber(activity.initialNumber);
            setTarget(null);
            setFeedback(null);
          }}
        >
          <RotateCcw size={18} />
        </button>
      </div>
      <p className="math-instruction">{activity.instruction}</p>
      <output className="built-number" aria-label="Deine Zahl">
        {numberLabel(number)}
      </output>
      <div className="place-board">
        {places.map((place) => {
          const digit = Math.floor(number / place.value) % 10;
          return (
            <div
              className={`place-column ${place.color} ${selected === place.value ? "place-selected" : ""}`}
              key={place.value}
            >
              <span className="place-name">{place.label}</span>
              <button
                className="place-digit"
                aria-label={`${place.label}: ${digit}, Wert ${digit * place.value}`}
                aria-pressed={selected === place.value}
                onClick={() => setSelected(place.value)}
              >
                {digit}
              </button>
              <div className="place-blocks" aria-hidden="true">
                {digit === 0 ? (
                  <span className="zero-block">0</span>
                ) : (
                  Array.from({ length: digit }, (_, index) => (
                    <span
                      key={index}
                      className={`number-block block-${place.short}`}
                    >
                      {place.value === 1000 ? "1 000" : place.value}
                    </span>
                  ))
                )}
              </div>
              <div className="digit-controls">
                <button
                  aria-label={`${place.label} verringern`}
                  disabled={digit === 0}
                  onClick={() => updateDigit(place.value, -1)}
                >
                  <Minus size={16} />
                </button>
                <span>× {numberLabel(place.value)}</span>
                <button
                  aria-label={`${place.label} erhöhen`}
                  disabled={digit === 9}
                  onClick={() => updateDigit(place.value, 1)}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div
        className={`place-explanation ${selectedPlace.color}`}
        aria-live="polite"
      >
        <strong>
          {selectedDigit} {selectedPlace.label} ={" "}
          {numberLabel(selectedDigit * selected)}
        </strong>
        <span>
          {selectedDigit === 0
            ? "An dieser Stelle steht eine 0. Sie hält den Platz frei."
            : `Die ${selectedDigit} steht an der ${selectedPlace.label}stelle.`}
        </span>
      </div>
      <div className="number-expansion" aria-label="Zerlegung der Zahl">
        {places.map((place, index) => (
          <span key={place.value}>
            {index > 0 && <span className="math-plus">+</span>}
            <strong className={`expansion-value ${place.color}`}>
              {numberLabel(
                (Math.floor(number / place.value) % 10) * place.value,
              )}
            </strong>
          </span>
        ))}
        <span className="math-plus">=</span>
        <strong>{numberLabel(number)}</strong>
      </div>
      <div className="build-challenges">
        <h3>{activity.challengeTitle}</h3>
        <div className="challenge-options">
          {activity.challenges.map((value) => (
            <button
              key={value}
              aria-pressed={target === value}
              onClick={() => {
                setTarget(value);
                setNumber(0);
                setFeedback(null);
              }}
            >
              Baue {numberLabel(value)}
            </button>
          ))}
        </div>
        {target !== null && (
          <div className="build-goal">
            <p>
              Stelle mit + und − die Zahl <strong>{numberLabel(target)}</strong>{" "}
              ein.
            </p>
            <button
              className="primary"
              onClick={() =>
                setFeedback(
                  number === target
                    ? `${numberLabel(target)} – richtig gebaut!`
                    : `Deine Zahl ist ${numberLabel(number)}. Gesucht ist ${numberLabel(target)}. Vergleiche die Stellen.`,
                )
              }
            >
              Zahl prüfen <Check size={18} />
            </button>
          </div>
        )}
        {feedback && (
          <p
            className={`build-feedback ${number === target ? "build-success" : ""}`}
            role="status"
            aria-label="Rückmeldung"
          >
            {feedback}
          </p>
        )}
      </div>
    </section>
  );
}
