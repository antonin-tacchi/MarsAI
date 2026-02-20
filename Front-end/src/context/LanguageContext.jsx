import { createContext, useCallback, useContext, useState } from "react";
import fr from "../i18n/fr.js";
import en from "../i18n/en.js";

const translations = { fr, en };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "fr");

  const changeLang = useCallback((newLang) => {
    const l = newLang.toLowerCase();
    setLang(l);
    localStorage.setItem("lang", l);
  }, []);

  const t = useCallback(
    (key, params) => {
      const keys = key.split(".");
      let value = translations[lang];
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }
      if (typeof value !== "string") {
        // fallback to French
        let fb = translations.fr;
        for (const k of keys) {
          fb = fb?.[k];
          if (fb === undefined) break;
        }
        value = typeof fb === "string" ? fb : key;
      }
      if (params) {
        return value.replace(/\{(\w+)\}/g, (_, p) =>
          params[p] !== undefined ? params[p] : `{${p}}`
        );
      }
      return value;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
