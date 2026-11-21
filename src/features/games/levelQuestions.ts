import type { Exercise } from "../../types";

export const TOTAL_LEVELS = 10;

// The page passes questions in difficulty order. Fixed bands keep a question
// exclusive to one level while shuffling its position within that level.
export function questionsForLevel(
  questions: Exercise[],
  level: number,
): Exercise[] {
  const first = Math.floor(((level - 1) * questions.length) / TOTAL_LEVELS);
  const last = Math.floor((level * questions.length) / TOTAL_LEVELS);
  const band = questions.slice(first, last);
  for (let index = band.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [band[index], band[swap]] = [band[swap], band[index]];
  }
  return band;
}
