import { useCallback, useEffect, useRef, useState } from "react";
import { useStoredState } from "../../hooks/useStoredState";
import { readCloudConfig } from "./cloudkit";
import { CloudSyncController } from "./CloudSyncController";
import type { SyncState } from "./types";
const config = readCloudConfig();
export function useCloudSync() {
  const [enabled, setEnabled] = useStoredState(
    "six-icloud-enabled",
    false,
    (value) => value === true,
  );
  const [state, setState] = useState<SyncState>({
    phase: config ? "disabled" : "not-configured",
  });
  const [retryVersion, setRetryVersion] = useState(0);
  const controller = useRef<CloudSyncController | null>(null);
  useEffect(() => {
    if (!config || !enabled) {
      setState({ phase: config ? "disabled" : "not-configured" });
      return;
    }
    const instance = new CloudSyncController(config, setState);
    controller.current = instance;
    void instance.start();
    return () => {
      instance.stop();
      if (controller.current === instance) controller.current = null;
    };
  }, [enabled, retryVersion]);
  return {
    enabled,
    configured: !!config,
    state,
    enable: () => setEnabled(true),
    retry: () => setRetryVersion((version) => version + 1),
    disable: () => setEnabled(false),
    syncNow: useCallback(() => controller.current?.syncNow(), []),
    refreshAuth: useCallback(() => controller.current?.refreshAuth(), []),
  };
}
export type CloudSync = ReturnType<typeof useCloudSync>;
