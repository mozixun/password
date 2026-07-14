import { useUI } from '@/store';
import { getTranslation, type Language, type Translations } from '@/i18n';

export function useTranslation() {
  const { language } = useUI();

  const t = getTranslation(language);

  return { t, language };
}

export function useTranslate() {
  const { t } = useTranslation();
  return t;
}

export function useLanguage(): Language {
  const { language } = useUI();
  return language;
}

export type { Translations };