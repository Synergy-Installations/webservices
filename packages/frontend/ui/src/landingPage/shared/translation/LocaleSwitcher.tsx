import { useLocale, useTranslations } from "next-intl";
import LocaleSwitcherSelect from "./LocaleSwitcherSelect";
import { routing } from "@com.synergy/frontend-shared-internationalization/routing";

/* eslint-disable-next-line */
export interface LocaleSwitcherProps {}

export const LocaleSwitcher = (props: LocaleSwitcherProps) => {
   const t = useTranslations('LandingPage.Shared.LocaleSwitcher');
  const locale = useLocale();
  return (
    <LocaleSwitcherSelect defaultValue={locale} label={t('label')} showSvgIcon>
      {routing.locales.map((cur) => (
        <option key={cur} value={cur}>
          {t('locale', {locale: cur.replace('-', '')})}
        </option>
      ))}
    </LocaleSwitcherSelect>
  );
};

export default LocaleSwitcher;