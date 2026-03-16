import { createContext, useContext, useState } from "react";
import type { Language } from "../i18n/translations";
import { translations } from "../i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("appLanguage") as Language | null;
    return stored === "hi" ? "hi" : "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("appLanguage", lang);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
    }
    if (result === undefined || result === null) {
      let fallback: any = translations.en;
      for (const k of keys) {
        fallback = fallback?.[k];
      }
      return typeof fallback === "string" ? fallback : key;
    }
    return typeof result === "string" ? result : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
