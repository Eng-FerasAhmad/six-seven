import { useEffect } from "react";
import type { ReactNode } from "react";
import { LanguageContext } from "./useLanguage";
export function LanguageProvider({
  english,
  updateDocument = true,
  children,
}: {
  english: boolean;
  updateDocument?: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!updateDocument) return;
    document.documentElement.lang = english ? "en" : "de";
    document.title = `six seeeven · ${english ? "Your learning world" : "Deine Lernwelt"}`;
  }, [english, updateDocument]);
  return (
    <LanguageContext.Provider value={english}>
      {children}
    </LanguageContext.Provider>
  );
}
