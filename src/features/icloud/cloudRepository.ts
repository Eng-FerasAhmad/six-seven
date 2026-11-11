import type {
  CloudDatabase,
  CloudError,
  CloudRecord,
  CloudResponse,
  ProgressSnapshot,
} from "./types";
import { emptySnapshot, parseSnapshot } from "./progressSnapshot";
const recordName = "reber-progress-v1";
export function cloudErrorCode(error: unknown): string {
  if (!error || typeof error !== "object") return "";
  const value = error as CloudError;
  return value.ckErrorCode ?? value.serverErrorCode ?? "";
}
function recordFrom(response: CloudResponse): CloudRecord {
  if (response.hasErrors || response.errors?.length)
    throw response.errors?.[0] ?? new Error("iCloud-Anfrage fehlgeschlagen.");
  const record = response.records?.[0];
  if (!record) throw new Error("iCloud hat keine gültige Antwort gesendet.");
  return record;
}
export async function fetchCloudProgress(
  database: CloudDatabase,
): Promise<{ snapshot: ProgressSnapshot; record: CloudRecord | null }> {
  try {
    const record = recordFrom(await database.fetchRecords(recordName));
    if (typeof record.fields?.payload?.value !== "string")
      throw new Error(
        "Die iCloud-Sicherung enthält keinen gültigen Lernverlauf.",
      );
    return { snapshot: parseSnapshot(record.fields.payload.value), record };
  } catch (error) {
    if (cloudErrorCode(error) === "NOT_FOUND")
      return { snapshot: emptySnapshot, record: null };
    throw error;
  }
}
export async function saveCloudProgress(
  database: CloudDatabase,
  snapshot: ProgressSnapshot,
  previous: CloudRecord | null,
) {
  const payload = JSON.stringify(snapshot);
  if (new TextEncoder().encode(payload).length > 700_000)
    throw new Error(
      "Der Lernverlauf ist für diese iCloud-Sicherung zu groß. Bitte lade eine Sicherung herunter.",
    );
  return recordFrom(
    await database.saveRecords({
      recordName,
      recordType: "LearningProgress",
      ...(previous?.recordChangeTag
        ? { recordChangeTag: previous.recordChangeTag }
        : {}),
      fields: { payload: { value: payload } },
    }),
  );
}
