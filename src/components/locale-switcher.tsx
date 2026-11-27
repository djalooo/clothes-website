import { SelectDropdown } from "@/components/select-dropdown";
import { useI18n } from "@/lib/i18n-context";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/lib/i18n";

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const options = LOCALES.map((code) => ({ value: code, label: LOCALE_LABEL[code] }));

  return (
    <SelectDropdown<Locale>
      ariaLabel={t("nav.language")}
      value={locale}
      options={options}
      onValueChange={setLocale}
      className={className}
    />
  );
}
