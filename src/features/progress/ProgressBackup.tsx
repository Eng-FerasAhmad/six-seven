import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { createBackup, restoreBackup } from "./backup";
export function ProgressBackup() {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  function download() {
    try {
      const url = URL.createObjectURL(
        new Blob([createBackup()], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `six-seeeven-fortschritt-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setError("");
    } catch {
      setError(
        "Die Sicherung konnte nicht erstellt werden. Bitte prüfe die Browsereinstellungen.",
      );
    }
  }
  async function restore(file?: File) {
    if (!file) return;
    try {
      if (file.size > 10_000_000) throw new Error("Diese Datei ist zu groß.");
      restoreBackup(await file.text());
      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Die Sicherung konnte nicht geladen werden.",
      );
    }
    if (input.current) input.current.value = "";
  }
  return (
    <section className="progress-backup">
      <h2>Fortschritt sichern</h2>
      <p>
        Dein Fortschritt bleibt in diesem Browser. Speichere eine Kopie für ein
        anderes Gerät oder als Sicherung.
      </p>
      <div>
        <button onClick={download}>
          <Download size={18} /> Sicherung herunterladen
        </button>
        <button onClick={() => input.current?.click()}>
          <Upload size={18} /> Sicherung laden
        </button>
      </div>
      <input
        ref={input}
        className="sr-only"
        type="file"
        accept=".json,application/json"
        aria-label="Fortschrittssicherung auswählen"
        onChange={(event) => void restore(event.target.files?.[0])}
      />
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
