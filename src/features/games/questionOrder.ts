import type { Exercise, SubjectId } from "../../types";
import { readStoredRaw, writeStoredRaw } from "../../utils/browserStorage";
export function questionOrder(questions: Exercise[], subjectId: SubjectId) {
  const key = `arcade-seen-${subjectId}`;
  let seen: Set<string>;
  try { seen = new Set<string>(JSON.parse(readStoredRaw(key) || "[]")); } catch { seen = new Set(); }
  let available = questions.filter((item) => !seen.has(item.id));
  if (available.length === 0) { seen = new Set(); available = questions; writeStoredRaw(key, "[]"); }
  const ordered: Exercise[] = [];
  for (let start = 0; start < available.length; start += 4) {
    const band = available.slice(start, start + 4);
    for (let index = band.length - 1; index > 0; index--) { const swap = Math.floor(Math.random() * (index + 1)); [band[index], band[swap]] = [band[swap], band[index]]; }
    ordered.push(...band);
  }
  return ordered;
}
export function rememberQuestion(subjectId: SubjectId, id: string) {
  const key = `arcade-seen-${subjectId}`;
  const seen = new Set<string>(JSON.parse(readStoredRaw(key) || "[]"));
  seen.add(id);
  writeStoredRaw(key, JSON.stringify([...seen]));
}
