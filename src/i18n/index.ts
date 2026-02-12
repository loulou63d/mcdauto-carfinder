import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './locales/de.json';
import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';

export const supportedLangs = ['de', 'fr', 'en', 'es', 'pt'] as const;
export type Lang = typeof supportedLangs[number];

export const langLabels: Record<Lang, string> = {
  de: 'DE',
  fr: 'FR',
  en: 'EN',
  es: 'ES',
  pt: 'PT',
};

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    fr: { translation: fr },
    en: { translation: en },
    es: { translation: es },
    pt: { translation: pt },
  },
  lng: 'de',
  fallbackLng: 'de',
  interpolation: { escapeValue: false },
});

export default i18n;
