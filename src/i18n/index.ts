import { zh } from './locales/zh';
import { en } from './locales/en';

export type Language = 'zh' | 'en';

export type TranslationKey = keyof typeof zh;

export type Translations = typeof zh;

export const translations: Record<Language, Translations> = {
  zh,
  en,
};

export const languageNames: Record<Language, string> = {
  zh: '中文',
  en: 'English',
};

export function getTranslation(language: Language): Translations {
  return translations[language];
}

export function getLanguageName(language: Language): string {
  return languageNames[language];
}