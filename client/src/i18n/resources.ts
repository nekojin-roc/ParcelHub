import en from "@/i18n/locales/en";
import de from "@/i18n/locales/de";
import fr from "@/i18n/locales/fr";
import ja from "@/i18n/locales/ja";
import zh from "@/i18n/locales/zh";

export const defaultNS = "translation";

export const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
  ja: {
    translation: ja,
  },
  fr: {
    translation: fr,
  },
  de: {
    translation: de,
  },
} as const;

export const supportedLanguages = ["en", "zh", "ja", "fr", "de"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const isSupportedLanguage = (language: string): language is SupportedLanguage =>
  supportedLanguages.includes(language as SupportedLanguage);
