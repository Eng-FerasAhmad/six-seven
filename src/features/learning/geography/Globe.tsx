import { useState } from "react";
import "./globe.css";

const R = 125;
function project(lat: number, lon: number, center: number) {
  const a = lat * Math.PI / 180;
  const b = (lon - center) * Math.PI / 180;
  return { x: 150 + R * Math.cos(a) * Math.sin(b), y: 150 - R * Math.sin(a), visible: Math.cos(a) * Math.cos(b) >= 0 };
}
function line(points: { x: number; y: number; visible: boolean }[]) {
  let path = "";
  let drawing = false;
  for (const point of points) {
    if (!point.visible) { drawing = false; continue; }
    path += `${drawing ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)} `;
    drawing = true;
  }
  return path;
}
export function Globe() {
  const [center, setCenter] = useState(0);
  const [latitude, setLatitude] = useState(30);
  const [longitude, setLongitude] = useState(20);
  const latitudeLines = [-60, -30, 0, 30, 60];
  const longitudeLines = Array.from({ length: 12 }, (_, i) => i * 30 - 150);
  const point = project(latitude, longitude, center);
  return <section className="globe-lab" aria-label="Interaktiver Globus mit Gradnetz">
    <h2>Entdecke das Gradnetz</h2>
    <p>Verschiebe die Ansicht und wähle eine Koordinate. Die rote Linie ist der Äquator, die gelbe der Nullmeridian.</p>
    <div className="globe-layout">
      <svg viewBox="0 0 300 300" role="img" aria-label={`Globus mit Gradnetz. Gewählter Ort: ${Math.abs(latitude)} Grad ${latitude < 0 ? "Süd" : "Nord"}, ${Math.abs(longitude)} Grad ${longitude < 0 ? "West" : "Ost"}.`}>
        <defs><radialGradient id="globe-water" cx="35%" cy="30%"><stop stopColor="#a9e4f5"/><stop offset="1" stopColor="#2d80b9"/></radialGradient><clipPath id="globe-clip"><circle cx="150" cy="150" r={R}/></clipPath></defs>
        <circle cx="150" cy="150" r={R} fill="url(#globe-water)" stroke="#225b83" strokeWidth="2"/>
        <g clipPath="url(#globe-clip)" fill="none">
          {latitudeLines.map(lat => <path key={lat} d={line(Array.from({length: 361}, (_, i) => project(lat, i - 180, center)))} stroke={lat === 0 ? "#ee4b43" : "#e6f4fa"} strokeWidth={lat === 0 ? 2.8 : 1.2}/>)}
          {longitudeLines.map(lon => <path key={lon} d={line(Array.from({length: 181}, (_, i) => project(i - 90, lon, center)))} stroke={lon === 0 ? "#ffe26a" : "#e6f4fa"} strokeWidth={lon === 0 ? 2.8 : 1.2}/>)}
          {point.visible && <><circle cx={point.x} cy={point.y} r="7" fill="#173050" stroke="white" strokeWidth="2"/></>}
        </g>
        <text x="150" y="17" textAnchor="middle">Nordpol</text><text x="150" y="294" textAnchor="middle">Südpol</text>
      </svg>
      <div className="globe-controls">
        <label>Ansicht drehen: {center}° <input type="range" min="-180" max="180" step="10" value={center} onChange={e => setCenter(Number(e.target.value))}/></label>
        <label>Breite: {Math.abs(latitude)}° {latitude < 0 ? "S" : "N"} <input type="range" min="-90" max="90" step="10" value={latitude} onChange={e => setLatitude(Number(e.target.value))}/></label>
        <label>Länge: {Math.abs(longitude)}° {longitude < 0 ? "W" : "O"} <input type="range" min="-180" max="180" step="10" value={longitude} onChange={e => setLongitude(Number(e.target.value))}/></label>
        <strong>Koordinate: {Math.abs(latitude)}° {latitude < 0 ? "S" : "N"} / {Math.abs(longitude)}° {longitude < 0 ? "W" : "O"}</strong>
        {!point.visible && <p>Der Punkt liegt auf der Rückseite. Drehe die Ansicht, um ihn zu sehen.</p>}
      </div>
    </div>
  </section>;
}
