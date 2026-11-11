import type { CourseAttempt, TestResult } from "../../types";
export interface ProgressSnapshot {
  version: 1;
  completed: string[];
  attempts: CourseAttempt[];
  results: TestResult[];
}
export interface CloudConfig {
  containerIdentifier: string;
  apiToken: string;
  environment: "development" | "production";
}
export interface CloudIdentity {
  userRecordName: string;
}
export interface CloudError {
  ckErrorCode?: string;
  serverErrorCode?: string;
  reason?: string;
}
export interface CloudRecord {
  recordName: string;
  recordType: string;
  recordChangeTag?: string;
  fields: { payload: { value: string } };
}
export interface CloudResponse {
  hasErrors?: boolean;
  errors?: CloudError[];
  records?: CloudRecord[];
}
export interface CloudDatabase {
  fetchRecords(name: string): Promise<CloudResponse>;
  saveRecords(record: CloudRecord): Promise<CloudResponse>;
}
export interface CloudContainer {
  privateCloudDatabase: CloudDatabase;
  setUpAuth(): Promise<CloudIdentity | null>;
  whenUserSignsIn(): Promise<CloudIdentity>;
  whenUserSignsOut(): Promise<void>;
}
export interface CloudKitSdk {
  configure(config: {
    containers: {
      containerIdentifier: string;
      environment: string;
      apiTokenAuth: {
        apiToken: string;
        persist: boolean;
        signInButton: { id: string; theme: string };
        signOutButton: { id: string; theme: string };
      };
    }[];
  }): void;
  getDefaultContainer(): CloudContainer;
}
export type SyncPhase =
  | "not-configured"
  | "disabled"
  | "connecting"
  | "signed-out"
  | "syncing"
  | "synced"
  | "offline"
  | "error"
  | "account-mismatch";
export interface SyncState {
  phase: SyncPhase;
  lastSyncedAt?: number;
  message?: string;
}
