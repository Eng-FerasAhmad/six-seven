import {
  readStoredRaw,
  subscribeStoredKey,
  writeStoredRaw,
} from "../../utils/browserStorage";
import { getCloudContainer } from "./cloudkit";
import {
  cloudErrorCode,
  fetchCloudProgress,
  saveCloudProgress,
} from "./cloudRepository";
import {
  applyProgressSnapshot,
  mergeSnapshots,
  progressKeys,
  readProgressSnapshot,
} from "./progressSnapshot";
import type {
  CloudConfig,
  CloudContainer,
  CloudIdentity,
  SyncState,
} from "./types";
const ownerKey = "six-icloud-owner";
interface Dependencies {
  connect: (config: CloudConfig) => Promise<CloudContainer>;
  online: () => boolean;
  now: () => number;
}
export class CloudSyncController {
  private stopped = false;
  private container: CloudContainer | null = null;
  private identity: CloudIdentity | null = null;
  private generation = 0;
  private blocked = false;
  private running: Promise<void> | null = null;
  private requested = false;
  private debounce: ReturnType<typeof setTimeout> | undefined;
  private poll: ReturnType<typeof setInterval> | undefined;
  private cleanup: (() => void)[] = [];
  private lastPayload = "";
  private lastSyncedAt: number | undefined;
  private readonly dependencies: Dependencies;
  constructor(
    private config: CloudConfig,
    private onState: (state: SyncState) => void,
    dependencies: Partial<Dependencies> = {},
  ) {
    this.dependencies = {
      connect: getCloudContainer,
      online: () => navigator.onLine,
      now: Date.now,
      ...dependencies,
    };
  }
  private report(phase: SyncState["phase"], message?: string) {
    if (!this.stopped)
      this.onState({ phase, message, lastSyncedAt: this.lastSyncedAt });
  }
  async start() {
    this.report("connecting");
    try {
      const container = await this.dependencies.connect(this.config);
      if (this.stopped) return;
      this.container = container;
      for (const key of progressKeys)
        this.cleanup.push(subscribeStoredKey(key, () => this.schedule()));
      const reconnect = () => {
        void this.syncNow();
      };
      const offline = () => {
        if (this.identity) this.report("offline");
      };
      const visible = () => {
        if (document.visibilityState === "visible") reconnect();
      };
      window.addEventListener("online", reconnect);
      window.addEventListener("offline", offline);
      window.addEventListener("focus", reconnect);
      document.addEventListener("visibilitychange", visible);
      this.cleanup.push(() => {
        window.removeEventListener("online", reconnect);
        window.removeEventListener("offline", offline);
        window.removeEventListener("focus", reconnect);
        document.removeEventListener("visibilitychange", visible);
      });
      this.poll = setInterval(() => {
        if (document.visibilityState !== "hidden") reconnect();
      }, 30_000);
      const identity = await container.setUpAuth();
      if (this.stopped) return;
      this.acceptIdentity(identity);
      void this.watchAuth(container, identity);
    } catch (error) {
      this.fail(error);
    }
  }
  private async watchAuth(
    container: CloudContainer,
    initial: CloudIdentity | null,
  ) {
    let identity = initial;
    try {
      while (!this.stopped) {
        if (identity) {
          await container.whenUserSignsOut();
          identity = null;
        } else identity = await container.whenUserSignsIn();
        if (!this.stopped) this.acceptIdentity(identity);
      }
    } catch (error) {
      this.fail(error);
    }
  }
  private acceptIdentity(identity: CloudIdentity | null) {
    this.generation++;
    this.identity = identity;
    this.blocked = false;
    this.lastPayload = "";
    this.lastSyncedAt = undefined;
    if (!identity) {
      this.report("signed-out");
      return;
    }
    const owner = `${this.config.containerIdentifier}:${this.config.environment}:${identity.userRecordName}`;
    const previous = readStoredRaw(ownerKey);
    if (previous && previous !== owner) {
      this.blocked = true;
      this.report("account-mismatch");
      return;
    }
    if (!writeStoredRaw(ownerKey, owner)) {
      this.blocked = true;
      this.report(
        "error",
        "Der Browser kann das iCloud-Konto nicht sicher zuordnen. Bitte erlaube das Speichern von Websitedaten.",
      );
      return;
    }
    void this.syncNow();
  }
  async refreshAuth() {
    if (!this.container || this.stopped) return;
    try {
      const identity = await this.container.setUpAuth();
      if (
        !this.stopped &&
        identity?.userRecordName !== this.identity?.userRecordName
      )
        this.acceptIdentity(identity);
    } catch (error) {
      this.fail(error);
    }
  }
  private schedule() {
    if (this.stopped || !this.identity || this.blocked) return;
    if (JSON.stringify(readProgressSnapshot()) === this.lastPayload) return;
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => {
      void this.syncNow();
    }, 800);
  }
  private isCurrent(generation: number) {
    return (
      !this.stopped &&
      !this.blocked &&
      !!this.identity &&
      generation === this.generation
    );
  }
  async syncNow(): Promise<void> {
    if (this.stopped || !this.container || !this.identity || this.blocked)
      return;
    if (!this.dependencies.online()) {
      this.report("offline");
      return;
    }
    if (this.running) {
      this.requested = true;
      return this.running;
    }
    const generation = this.generation;
    this.running = this.flush(generation).finally(() => {
      this.running = null;
      if (this.requested && !this.stopped) {
        this.requested = false;
        this.schedule();
      }
    });
    return this.running;
  }
  private async flush(generation: number) {
    this.report("syncing");
    try {
      const database = this.container!.privateCloudDatabase;
      for (let attempt = 0; attempt < 3; attempt++) {
        const remote = await fetchCloudProgress(database);
        if (!this.isCurrent(generation)) return;
        const merged = mergeSnapshots(remote.snapshot, readProgressSnapshot());
        try {
          if (
            !remote.record ||
            JSON.stringify(merged) !== JSON.stringify(remote.snapshot)
          )
            await saveCloudProgress(database, merged, remote.record);
        } catch (error) {
          if (
            ["CONFLICT", "EXISTS"].includes(cloudErrorCode(error)) &&
            attempt < 2
          )
            continue;
          throw error;
        }
        if (!this.isCurrent(generation)) return;
        this.lastPayload = JSON.stringify(merged);
        applyProgressSnapshot(merged);
        this.lastSyncedAt = this.dependencies.now();
        this.report("synced");
        this.schedule();
        return;
      }
    } catch (error) {
      if (this.isCurrent(generation)) this.fail(error);
    }
  }
  private fail(error: unknown) {
    if (this.stopped) return;
    if (!this.dependencies.online()) {
      this.report("offline");
      return;
    }
    const code = cloudErrorCode(error);
    if (["AUTHENTICATION_REQUIRED", "AUTHENTICATION_FAILED"].includes(code)) {
      this.report("error", "Bitte melde dich erneut bei iCloud an.");
      return;
    }
    if (["ACCESS_DENIED", "BAD_REQUEST", "ZONE_NOT_FOUND"].includes(code)) {
      this.report(
        "error",
        "iCloud ist noch nicht vollständig eingerichtet. Bitte prüfe Container, Freigaben und das Datenbankschema.",
      );
      return;
    }
    if (code === "QUOTA_EXCEEDED") {
      this.report(
        "error",
        "Der iCloud-Speicher ist voll. Dein Fortschritt bleibt auf diesem Gerät gespeichert.",
      );
      return;
    }
    this.report(
      "error",
      error instanceof Error
        ? error.message
        : "iCloud ist gerade nicht erreichbar. Dein Fortschritt bleibt lokal gespeichert. Versuche es später erneut.",
    );
  }
  stop() {
    this.stopped = true;
    this.generation++;
    clearTimeout(this.debounce);
    clearInterval(this.poll);
    this.cleanup.forEach((cleanup) => cleanup());
    this.cleanup = [];
  }
}
