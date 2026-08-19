import en from "@/i18n/locales/en";

export const defaultNS = "translation";

export const resources = {
  en: {
    translation: en,
  },
} as const;

export const supportedLanguages = Object.keys(resources);
