import { CloudSyncPanel } from "../icloud/CloudSyncPanel";
import type { CloudSync } from "../icloud/useCloudSync";
import { ProgressBackup } from "./ProgressBackup";
export function SettingsPage({ cloudSync }: { cloudSync: CloudSync }) {
  return (
    <>
      <h1>Einstellungen</h1>
      <CloudSyncPanel sync={cloudSync} />
      <ProgressBackup />
    </>
  );
}
