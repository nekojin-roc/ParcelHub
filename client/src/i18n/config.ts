import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { defaultNS, resources, supportedLanguages } from "@/i18n/resources";

const updateDocumentLanguage = (language: string) => {
  document.documentElement.lang = language;
  document.documentElement.dir = i18n.dir(language);
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    defaultNS,
    resources,
    fallbackLng: "en",
    supportedLngs: supportedLanguages,
    nonExplicitSupportedLngs: true,
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "parcelhub.language",
    },
    react: {
      useSuspense: false,
    },
  });

updateDocumentLanguage(i18n.resolvedLanguage ?? i18n.language);
i18n.on("languageChanged", updateDocumentLanguage);

export default i18n;
