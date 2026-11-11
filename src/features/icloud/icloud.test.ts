import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { exercises, tests } from "../../content";
import { useCourseHistory } from "../../hooks/useCourseHistory";
import { useLearningProgress } from "../../hooks/useLearningProgress";
import { readStoredRaw, writeStoredRaw } from "../../utils/browserStorage";
import { readCloudConfig } from "./cloudkit";
import { CloudSyncController } from "./CloudSyncController";
import {
  applyProgressSnapshot,
  emptySnapshot,
  mergeSnapshots,
  parseSnapshot,
  readProgressSnapshot,
} from "./progressSnapshot";
import type {
  CloudConfig,
  CloudContainer,
  CloudDatabase,
  CloudIdentity,
  CloudRecord,
  CloudResponse,
  ProgressSnapshot,
  SyncState,
} from "./types";
import type { CourseAttempt, TestResult } from "../../types";
const config: CloudConfig = {
  containerIdentifier: "iCloud.test.sixseeeven",
  apiToken: "browser-token",
  environment: "development",
};
const exercise = exercises[0];
const courseAttempt = (id: string): CourseAttempt => ({
  id,
  exerciseId: exercise.id,
  lessonId: exercise.lessonId,
  correct: true,
  answeredAt: 1000,
});
const result = (id: string): TestResult => ({
  id,
  testId: tests[0].id,
  startedAt: 1000,
  deadline: 301000,
  finishedAt: 2000,
  answers: {},
  correct: 0,
  total: tests[0].exerciseIds.length,
  timedOut: false,
});
const pending = <T>() => new Promise<T>(() => {});
class MemoryDatabase implements CloudDatabase {
  record: CloudRecord | null = null;
  saves = 0;
  beforeSave?: () => void;
  fetchRecords = vi.fn(async (): Promise<CloudResponse> =>
    this.record
      ? { records: [structuredClone(this.record)] }
      : { hasErrors: true, errors: [{ ckErrorCode: "NOT_FOUND" }] },
  );
  saveRecords = vi.fn(async (record: CloudRecord): Promise<CloudResponse> => {
    this.beforeSave?.();
    this.beforeSave = undefined;
    if (this.record && record.recordChangeTag !== this.record.recordChangeTag)
      return { hasErrors: true, errors: [{ ckErrorCode: "CONFLICT" }] };
    this.saves++;
    this.record = {
      ...structuredClone(record),
      recordChangeTag: String(this.saves),
    };
    return { records: [structuredClone(this.record)] };
  });
  seed(snapshot: ProgressSnapshot, tag = "seed") {
    this.record = {
      recordName: "reber-progress-v1",
      recordType: "LearningProgress",
      recordChangeTag: tag,
      fields: { payload: { value: JSON.stringify(snapshot) } },
    };
  }
}
const controllers: CloudSyncController[] = [];
afterEach(() => {
  controllers.forEach((controller) => controller.stop());
  controllers.length = 0;
  vi.useRealTimers();
});
function setup(
  database = new MemoryDatabase(),
  identity: CloudIdentity | null = { userRecordName: "parent-account" },
) {
  const container: CloudContainer = {
    privateCloudDatabase: database,
    setUpAuth: vi.fn(async () => identity),
    whenUserSignsIn: () => pending<CloudIdentity>(),
    whenUserSignsOut: () => pending<void>(),
  };
  const states: SyncState[] = [];
  let online = true;
  const controller = new CloudSyncController(
    config,
    (state) => states.push(state),
    { connect: async () => container, online: () => online, now: () => 12345 },
  );
  controllers.push(controller);
  return {
    controller,
    container,
    database,
    states,
    offline: () => {
      online = false;
    },
    online: () => {
      online = true;
    },
  };
}
describe("CloudKit configuration", () => {
  it("stays disabled until the container and browser token are configured", () => {
    expect(readCloudConfig({})).toBeNull();
    expect(
      readCloudConfig({ VITE_CLOUDKIT_CONTAINER_ID: "iCloud.example" }),
    ).toBeNull();
    expect(
      readCloudConfig({
        VITE_CLOUDKIT_CONTAINER_ID: config.containerIdentifier,
        VITE_CLOUDKIT_API_TOKEN: config.apiToken,
        VITE_CLOUDKIT_ENVIRONMENT: "production",
      }),
    ).toEqual({ ...config, environment: "production" });
  });
});
describe("progress merging", () => {
  it("merges two devices deterministically without duplicate history or lost scores", () => {
    const first: ProgressSnapshot = {
      version: 1,
      completed: [exercises[0].id],
      attempts: [courseAttempt("first")],
      results: [result("test-1")],
    };
    const second: ProgressSnapshot = {
      version: 1,
      completed: [exercises[1].id],
      attempts: [courseAttempt("first"), courseAttempt("second")],
      results: [result("test-2")],
    };
    const merged = mergeSnapshots(first, second);
    expect(merged).toEqual(mergeSnapshots(second, first));
    expect(merged.completed).toHaveLength(2);
    expect(merged.attempts).toHaveLength(2);
    expect(merged.results).toHaveLength(2);
    expect(mergeSnapshots(merged, first)).toEqual(merged);
  });
  it("rejects unknown or corrupt cloud formats instead of replacing local progress", () => {
    expect(() => parseSnapshot('{"version":2}')).toThrow();
    expect(() =>
      parseSnapshot(JSON.stringify({ ...emptySnapshot, attempts: [{}] })),
    ).toThrow();
  });
  it("updates live React state while preserving a running local test", () => {
    const session = {
      id: "running-test",
      testId: tests[0].id,
      startedAt: Date.now(),
      deadline: Date.now() + 300000,
      answers: {},
    };
    writeStoredRaw(
      "six-tests",
      JSON.stringify({ active: [session], results: [] }),
    );
    const progress = renderHook(useLearningProgress);
    const history = renderHook(useCourseHistory);
    act(() =>
      applyProgressSnapshot({
        ...emptySnapshot,
        completed: [exercise.id],
        attempts: [courseAttempt("downloaded")],
      }),
    );
    expect(progress.result.current.completed).toContain(exercise.id);
    expect(history.result.current.attempts).toHaveLength(1);
    expect(JSON.parse(readStoredRaw("six-tests")!).active).toEqual([session]);
  });
});
describe("private iCloud sync", () => {
  it("merges downloaded progress and uploads local progress using the private database", async () => {
    const test = setup();
    test.database.seed({
      ...emptySnapshot,
      completed: [exercises[1].id],
      results: [result("remote-result")],
    });
    writeStoredRaw(
      "six-course-history",
      JSON.stringify([courseAttempt("local-attempt")]),
    );
    await test.controller.start();
    await test.controller.syncNow();
    const saved = parseSnapshot(test.database.record!.fields.payload.value);
    expect(saved.completed).toContain(exercises[1].id);
    expect(saved.attempts).toHaveLength(1);
    expect(saved.results).toHaveLength(1);
    expect(readProgressSnapshot()).toEqual(saved);
    expect(test.states.at(-1)?.phase).toBe("synced");
  });
  it("retries a change-tag conflict by fetching and merging again", async () => {
    const test = setup();
    test.database.seed(emptySnapshot);
    writeStoredRaw(
      "six-course-history",
      JSON.stringify([courseAttempt("local")]),
    );
    test.database.beforeSave = () =>
      test.database.seed(
        { ...emptySnapshot, attempts: [courseAttempt("other-device")] },
        "new-tag",
      );
    await test.controller.start();
    await test.controller.syncNow();
    expect(test.database.saveRecords).toHaveBeenCalledTimes(2);
    expect(
      parseSnapshot(test.database.record!.fields.payload.value).attempts.map(
        (attempt) => attempt.id,
      ),
    ).toEqual(["local", "other-device"]);
  });
  it("keeps offline work and sends it after reconnection", async () => {
    const test = setup();
    test.offline();
    writeStoredRaw("six-completed", JSON.stringify([exercise.id]));
    await test.controller.start();
    await test.controller.syncNow();
    expect(test.database.saveRecords).not.toHaveBeenCalled();
    expect(test.states.at(-1)?.phase).toBe("offline");
    test.online();
    await test.controller.syncNow();
    expect(
      parseSnapshot(test.database.record!.fields.payload.value).completed,
    ).toContain(exercise.id);
  });
  it("never uploads one account’s local progress to another account", async () => {
    writeStoredRaw(
      "six-icloud-owner",
      `${config.containerIdentifier}:${config.environment}:different-account`,
    );
    const test = setup();
    await test.controller.start();
    await test.controller.syncNow();
    expect(test.states.at(-1)?.phase).toBe("account-mismatch");
    expect(test.database.fetchRecords).not.toHaveBeenCalled();
    expect(test.database.saveRecords).not.toHaveBeenCalled();
  });
  it("does not write or apply an in-flight sync after it has been stopped", async () => {
    const test = setup();
    let resolve!: (response: CloudResponse) => void;
    test.database.fetchRecords.mockImplementation(
      () =>
        new Promise((response) => {
          resolve = response;
        }),
    );
    await test.controller.start();
    const sync = test.controller.syncNow();
    test.controller.stop();
    resolve({ hasErrors: true, errors: [{ ckErrorCode: "NOT_FOUND" }] });
    await sync;
    expect(test.database.saveRecords).not.toHaveBeenCalled();
    expect(test.states.some((state) => state.phase === "synced")).toBe(false);
  });
  it("does not overwrite a cloud record it cannot validate", async () => {
    const test = setup();
    test.database.seed(emptySnapshot);
    test.database.record!.fields.payload.value = '{"version":99}';
    writeStoredRaw("six-completed", JSON.stringify([exercise.id]));
    await test.controller.start();
    await test.controller.syncNow();
    expect(test.states.at(-1)?.phase).toBe("error");
    expect(test.database.saveRecords).not.toHaveBeenCalled();
    expect(readProgressSnapshot().completed).toContain(exercise.id);
  });
  it("uses a full fetch before reporting success even when no upload is needed", async () => {
    const test = setup();
    test.database.seed(emptySnapshot);
    await test.controller.start();
    await test.controller.syncNow();
    expect(test.database.fetchRecords).toHaveBeenCalled();
    expect(test.database.saveRecords).not.toHaveBeenCalled();
    expect(test.states.at(-1)).toMatchObject({
      phase: "synced",
      lastSyncedAt: 12345,
    });
  });
});

describe("automatic cloud updates", () => {
  it("automatically uploads local progress after the debounce", async () => {
    vi.useFakeTimers();
    const test = setup();
    test.database.seed(emptySnapshot);
    await test.controller.start();
    await test.controller.syncNow();
    writeStoredRaw("six-completed", JSON.stringify([exercise.id]));
    await vi.advanceTimersByTimeAsync(800);
    expect(
      parseSnapshot(test.database.record!.fields.payload.value).completed,
    ).toContain(exercise.id);
  });
  it("keeps changes made during an upload and sends them in a following sync", async () => {
    const test = setup();
    test.database.seed(emptySnapshot);
    writeStoredRaw(
      "six-course-history",
      JSON.stringify([courseAttempt("first")]),
    );
    let release!: () => void;
    const delay = new Promise<void>((resolve) => {
      release = resolve;
    });
    const original = test.database.saveRecords.getMockImplementation()!;
    test.database.saveRecords.mockImplementationOnce(async (record) => {
      await delay;
      return original(record);
    });
    await test.controller.start();
    const firstSync = test.controller.syncNow();
    await vi.waitFor(() =>
      expect(test.database.saveRecords).toHaveBeenCalled(),
    );
    writeStoredRaw(
      "six-course-history",
      JSON.stringify([courseAttempt("first"), courseAttempt("second")]),
    );
    release();
    await firstSync;
    expect(readProgressSnapshot().attempts).toHaveLength(2);
    await test.controller.syncNow();
    expect(
      parseSnapshot(test.database.record!.fields.payload.value).attempts,
    ).toHaveLength(2);
  });
  it("ignores an old-account response after sign-out and blocks a different account", async () => {
    const test = setup();
    let signOut!: () => void;
    let signIn!: (identity: CloudIdentity) => void;
    let fetched!: (response: CloudResponse) => void;
    const out = new Promise<void>((resolve) => {
      signOut = resolve;
    });
    const incoming = new Promise<CloudIdentity>((resolve) => {
      signIn = resolve;
    });
    test.container.whenUserSignsOut = vi
      .fn()
      .mockReturnValueOnce(out)
      .mockImplementation(() => pending<void>());
    test.container.whenUserSignsIn = () => incoming;
    test.database.fetchRecords.mockImplementation(
      () =>
        new Promise((resolve) => {
          fetched = resolve;
        }),
    );
    await test.controller.start();
    const syncing = test.controller.syncNow();
    signOut();
    await vi.waitFor(() =>
      expect(test.states.at(-1)?.phase).toBe("signed-out"),
    );
    signIn({ userRecordName: "another-account" });
    await vi.waitFor(() =>
      expect(test.states.at(-1)?.phase).toBe("account-mismatch"),
    );
    fetched({ hasErrors: true, errors: [{ ckErrorCode: "NOT_FOUND" }] });
    await syncing;
    expect(test.database.saveRecords).not.toHaveBeenCalled();
    expect(test.states.at(-1)?.phase).toBe("account-mismatch");
  });
});
