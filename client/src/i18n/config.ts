import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import {
  defaultNS,
  isSupportedLanguage,
  resources,
  supportedLanguages,
  type SupportedLanguage,
} from "@/i18n/resources";

const LANGUAGE_COOKIE_NAME = "parcelhub.language";
const LANGUAGE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const getSupportedLanguage = (language?: string): SupportedLanguage => {
  const baseLanguage = language?.split("-")[0]?.toLowerCase();
  return baseLanguage && isSupportedLanguage(baseLanguage) ? baseLanguage : "en";
};

const updateDocumentLanguage = (language: string) => {
  const supportedLanguage = getSupportedLanguage(language);
  document.documentElement.lang = supportedLanguage;
  document.documentElement.dir = i18n.dir(supportedLanguage);
};

const storeLanguagePreference = (language: SupportedLanguage) => {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${encodeURIComponent(language)}; Path=/; Max-Age=${LANGUAGE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
};

export const changeLanguage = async (language: SupportedLanguage) => {
  await i18n.changeLanguage(language);
  storeLanguagePreference(language);
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    defaultNS,
    resources,
    fallbackLng: "en",
    supportedLngs: [...supportedLanguages],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["cookie", "navigator"],
      caches: [],
      lookupCookie: LANGUAGE_COOKIE_NAME,
    },
    react: {
      useSuspense: false,
    },
  });

updateDocumentLanguage(i18n.resolvedLanguage ?? i18n.language);
i18n.on("languageChanged", updateDocumentLanguage);

export default i18n;
