import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeLanguage, getSupportedLanguage } from "@/i18n/config";
import { isSupportedLanguage } from "@/i18n/resources";

const languageOptions = [
  { code: "en", nameKey: "common.language.names.en" },
  { code: "zh", nameKey: "common.language.names.zh" },
  { code: "ja", nameKey: "common.language.names.ja" },
  { code: "fr", nameKey: "common.language.names.fr" },
  { code: "de", nameKey: "common.language.names.de" },
] as const;

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const currentLanguage = getSupportedLanguage(i18n.resolvedLanguage ?? i18n.language);
  const currentLanguageName = languageOptions.find(
    ({ code }) => code === currentLanguage
  )?.nameKey;

  const handleValueChange = (language: string) => {
    if (isSupportedLanguage(language)) {
      void changeLanguage(language);
    }
  };

  return (
    <Select value={currentLanguage} onValueChange={handleValueChange}>
      <SelectTrigger
        className="w-20 shrink-0"
        aria-label={`${t("common.language.selectorLabel")}: ${
          currentLanguageName ? t(currentLanguageName) : currentLanguage.toUpperCase()
        }`}
      >
        <SelectValue>{currentLanguage.toUpperCase()}</SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        <SelectGroup>
          <SelectLabel>{t("common.language.selectorLabel")}</SelectLabel>
          {languageOptions.map(({ code, nameKey }) => (
            <SelectItem key={code} value={code}>
              {code.toUpperCase()} — {t(nameKey)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
