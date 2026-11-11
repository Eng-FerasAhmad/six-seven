import { useEffect } from "react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { formatDateTime } from "../../utils/dates";
import type { CloudSync } from "./useCloudSync";
const messages = {
  "not-configured":
    "iCloud wird noch eingerichtet. Dein Fortschritt bleibt auf diesem Gerät gespeichert.",
  disabled:
    "Verbinde iCloud, um deinen Fortschritt auf deinen Geräten zu verwenden.",
  connecting: "Verbindung zu iCloud wird hergestellt …",
  "signed-out": "Melde dich mit demselben Apple Account auf deinen Geräten an.",
  syncing: "Dein Fortschritt wird abgeglichen …",
  synced: "Dein Fortschritt ist in iCloud gesichert.",
  offline:
    "Du bist offline. Wir synchronisieren, sobald du wieder verbunden bist.",
  error:
    "iCloud ist gerade nicht erreichbar. Dein Fortschritt bleibt auf diesem Gerät gespeichert.",
  "account-mismatch":
    "Dieser Browser ist bereits mit einem anderen iCloud-Konto verbunden. Verwende das bisherige Konto oder ein anderes Browserprofil, damit Lernverläufe getrennt bleiben.",
} as const;
export function CloudSyncPanel({ sync }: { sync: CloudSync }) {
  const { enabled, configured, state, refreshAuth } = sync;
  useEffect(() => {
    if (enabled) void refreshAuth();
  }, [enabled, refreshAuth]);
  return (
    <section className="cloud-sync-panel" aria-labelledby="icloud-heading">
      <div className="cloud-sync-heading">
        <Cloud size={24} />
        <h2 id="icloud-heading">iCloud</h2>
      </div>
      <p role="status">{state.message ?? messages[state.phase]}</p>
      {state.lastSyncedAt && (
        <p className="cloud-sync-time">
          Zuletzt abgeglichen: {formatDateTime(state.lastSyncedAt)}
        </p>
      )}
      {configured && !enabled && (
        <button className="primary" onClick={sync.enable}>
          <Cloud size={18} /> Mit iCloud verbinden
        </button>
      )}
      <div className="icloud-auth" hidden={!enabled || !configured}>
        <div id="icloud-sign-in" />
        <div id="icloud-sign-out" />
      </div>
      {configured && enabled && (
        <div className="cloud-sync-actions">
          <button
            onClick={() => {
              if (state.phase === "error" || state.phase === "offline")
                sync.retry();
              else
                void Promise.resolve(refreshAuth()).then(() => sync.syncNow());
            }}
            disabled={state.phase === "connecting" || state.phase === "syncing"}
          >
            <RefreshCw size={18} /> Jetzt abgleichen
          </button>
          <button onClick={sync.disable}>
            <CloudOff size={18} /> Synchronisierung ausschalten
          </button>
        </div>
      )}
      {enabled && (
        <p className="cloud-sync-note">
          Kurse und fertige Testergebnisse werden privat gespeichert. Laufende
          Tests bleiben auf diesem Gerät. Lokale Daten und iCloud-Sicherungen
          bleiben beim Ausschalten erhalten.
        </p>
      )}
    </section>
  );
}
