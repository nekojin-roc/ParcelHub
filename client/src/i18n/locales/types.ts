import type en from "@/i18n/locales/en";

type StringifyValues<T> = {
  readonly [Key in keyof T]: T[Key] extends string ? string : StringifyValues<T[Key]>;
};

export type TranslationResource = StringifyValues<typeof en>;
