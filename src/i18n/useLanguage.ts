import { createContext, useContext } from "react";
import type { SubjectId } from "../types";
export const LanguageContext = createContext(false);
const englishSubjects: Record<SubjectId, string> = {
  mathematik: "Mathematics",
  deutsch: "German",
  englisch: "English",
  "natur-technik": "Nature & Technology",
  geographie: "Geography",
};
export function useLanguage() {
  const english = useContext(LanguageContext);
  return {
    t: (german: string, englishText: string) =>
      english ? englishText : german,
    subjectName: (id: SubjectId, fallback: string) =>
      english ? englishSubjects[id] : fallback,
  };
}
