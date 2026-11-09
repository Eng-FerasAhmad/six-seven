import { useState } from "react";
import type { AdditionActivity } from "../../../types";
import "./math.css";
export function AdditionLesson({ activity }: { activity: AdditionActivity }) {
  const [first, setFirst] = useState(activity.initialFirst);
  const [second, setSecond] = useState(activity.initialSecond);
  const bridge = Math.min((10 - (first % 10)) % 10, second);
  const rest = second - bridge;
  const point = (number: number) => 30 + (number / 80) * 340;
  return (
    <section className="math-lab" aria-label="Addition am Zahlenstrahl">
      <div className="math-lab-heading">
        <div>
          <span className="math-topic">+</span>
          <h2>{activity.title}</h2>
        </div>
      </div>
      <p className="math-instruction">{activity.instruction}</p>
      <div className="addition-equation" aria-live="polite">
        <strong>{first}</strong>
        <span>+</span>
        <strong>{second}</strong>
        <span>=</span>
        <strong className="sum-result">{first + second}</strong>
      </div>
      <svg
        className="number-line"
        viewBox="0 0 400 155"
        role="img"
        aria-label={`${first} plus ${second} ergibt ${first + second}. Erster Sprung ${bridge}, zweiter Sprung ${rest}.`}
      >
        <line x1="30" y1="108" x2="370" y2="108" className="number-line-axis" />
        {Array.from({ length: 5 }, (_, index) => index * 20).map((number) => (
          <g key={number}>
            <line
              x1={point(number)}
              y1="102"
              x2={point(number)}
              y2="114"
              className="number-line-axis"
            />
            <text x={point(number)} y="140" textAnchor="middle">
              {number}
            </text>
          </g>
        ))}
        {bridge > 0 && (
          <>
            <path
              d={`M ${point(first)} 102 Q ${point(first + bridge / 2)} 20 ${point(first + bridge)} 102`}
              className="jump-bridge"
            />
            <text
              x={point(first + bridge / 2)}
              y="48"
              textAnchor="middle"
              className="jump-label"
            >
              +{bridge}
            </text>
          </>
        )}
        {rest > 0 && (
          <>
            <path
              d={`M ${point(first + bridge)} 102 Q ${point(first + bridge + rest / 2)} 10 ${point(first + second)} 102`}
              className="jump-rest"
            />
            <text
              x={point(first + bridge + rest / 2)}
              y="30"
              textAnchor="middle"
              className="jump-label"
            >
              +{rest}
            </text>
          </>
        )}
        <circle cx={point(first)} cy="108" r="6" className="start-point" />
        <circle
          cx={point(first + second)}
          cy="108"
          r="6"
          className="end-point"
        />
      </svg>
      <div className="addition-sliders">
        <label>
          Erste Zahl <strong>{first}</strong>
          <input
            type="range"
            min="0"
            max="50"
            value={first}
            onChange={(event) => setFirst(Number(event.target.value))}
          />
        </label>
        <label>
          Zweite Zahl <strong>{second}</strong>
          <input
            type="range"
            min="0"
            max="30"
            value={second}
            onChange={(event) => setSecond(Number(event.target.value))}
          />
        </label>
      </div>
      <div className="addition-steps">
        <div>
          <span>1</span>
          <p>
            {bridge > 0
              ? (first + bridge) % 10 === 0
                ? `Bis zum nächsten Zehner: ${first} + ${bridge} = ${first + bridge}`
                : `Ein Sprung reicht: ${first} + ${bridge} = ${first + bridge}`
              : `${first} ist schon ein voller Zehner.`}
          </p>
        </div>
        <div>
          <span>2</span>
          <p>
            Den Rest dazu: {first + bridge} + {rest} ={" "}
            <strong>{first + second}</strong>
          </p>
        </div>
      </div>
      <div className="challenge-options">
        {activity.examples.map((example) => (
          <button
            key={`${example.first}-${example.second}`}
            onClick={() => {
              setFirst(example.first);
              setSecond(example.second);
            }}
          >
            {example.first} + {example.second}
          </button>
        ))}
      </div>
    </section>
  );
}
