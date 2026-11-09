import { useEffect } from "react";
import type { ReactNode } from "react";
import { LanguageContext } from "./useLanguage";
export function LanguageProvider({
  english,
  children,
}: {
  english: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = english ? "en" : "de";
    document.title = `six seeeven · ${english ? "Your learning world" : "Deine Lernwelt"}`;
  }, [english]);
  return (
    <LanguageContext.Provider value={english}>
      {children}
    </LanguageContext.Provider>
  );
}
