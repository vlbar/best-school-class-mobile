import i18n from 'i18next';
import { NativeModules, Platform } from 'react-native';
import {
  initReactI18next,
  useTranslation as useI18nTranslations,
} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './../translations/en.json';
import ru from './../translations/ru.json';
import de from './../translations/de.json';
import fr from './../translations/fr.json';
import ja from './../translations/ja.json';

const defaultLanguage = 'en';
export const availableLanguages = [
  {
    name: 'en',
    displayName: 'English (US)',
  },
  {
    name: 'ru',
    displayName: 'Русский (Россия)',
  },
  {
    name: 'de',
    displayName: 'Deutsch (Deutschland)',
  },
  {
    name: 'fr',
    displayName: 'Français (France)',
  },
  {
    name: 'ja',
    displayName: '日本語 (日本)',
  },
];

// translation catalog
const resources = {
  en: { translation: en },
  ru: { translation: ru },
  de: { translation: de },
  fr: { translation: fr },
  ja: { translation: ja },
};

export async function configureInternationalization() {
  let language = defaultLanguage
  await AsyncStorage.getItem('@language')
    .then(lang => {
      if (lang !== null) language = lang;
      else language = getFallbackAvailableLanguage(getSystemLanguage());
    })
    .catch(err => {
      console.log(err);
      language = getFallbackAvailableLanguage(getSystemLanguage());
    })

  return initInternationalization(language);
}

function initInternationalization(language) {
  return i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: defaultLanguage,
    compatibilityJSON: 'v3',
    keySeparator: '.',
    interpolation: {
      escapeValue: false,
    },
  });
}

function getSystemLanguage() {
  return (
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale
      : NativeModules.I18nManager.localeIdentifier
  ).replace('_', '-');
}

function getFallbackAvailableLanguage(language) {
  let targetLanguage = availableLanguages.find(x => x.name === language);
  if (!targetLanguage)
    targetLanguage = availableLanguages.find(
      x => x.name === language.substring(0, 2),
    );
  if (!targetLanguage) return defaultLanguage;
  else return targetLanguage.name;
}

export function getCurrentLanguage() {
  const { i18n } = useI18nTranslations();
  let languageName = i18n.language;
  let displayName = availableLanguages.find(
    x => x.name === languageName,
  ).displayName;

  return {
    languageName,
    displayName,
  };
}

export function changeLanguage(lng) {
  i18n.changeLanguage(lng);
  AsyncStorage.setItem('@language', lng).catch(err => console.log(err));
}

export function useTranslation() {
  const { t, i18n } = useI18nTranslations();
  return { translate: t, options: i18n };
}

export function translate(key) {
  if (!i18n.isInitialized) return key;
  const { t } = useI18nTranslations();
  return t(key);
}

export function getI(key, defaultValue) {
  return translate(key);
}

export default i18n;
