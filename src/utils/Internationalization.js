import i18n from 'i18next';
import { NativeModules, Platform } from 'react-native';
import { initReactI18next, useTranslation as useI18nTranslations } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'moment/locale/ru';
import 'moment/locale/fr';
import 'moment/locale/ja';
import 'moment/locale/de';

const defaultLanguage = 'en';
const translations = [
  {
    name: 'en',
    displayName: 'English (US)',
    translation: require('./../translations/en.json'),
  },
  {
    name: 'ru',
    displayName: 'Русский (Россия)',
    translation: require('./../translations/ru.json'),
  },
  {
    name: 'de',
    displayName: 'Deutsch (Deutschland)',
    translation: require('./../translations/de.json'),
  },
  {
    name: 'fr',
    displayName: 'Français (France)',
    translation: require('./../translations/fr.json'),
  },
  {
    name: 'ja',
    displayName: '日本語 (日本)',
    translation: require('./../translations/ja.json'),
  },
];

export const availableLanguages = translations.map(x => ({
  name: x.name,
  displayName: x.displayName,
}));

export async function configureInternationalization() {
  let resources = {};
  translations.forEach(x => {
    const translation = x.translation;
    resources[x.name] = { translation };
  });

  let language = defaultLanguage;
  await AsyncStorage.getItem('@language')
    .then(lang => {
      if (lang !== null) language = lang;
      else language = getFallbackAvailableLanguage(getSystemLanguage());
    })
    .catch(err => {
      console.log(err);
      language = getFallbackAvailableLanguage(getSystemLanguage());
    });

  return initInternationalization(language, resources);
}

function initInternationalization(language, resources) {
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

/*
  Examples of using:
  translate('jabroni.cringe');
  translate('jabroni.cringe', 'Jabromi Cringme');
  translate('jabroni.cringe', {name: 'Master'});
  translate('jabroni.cringe', 'Jabromi Cringme is {{name}}', {name: 'Slave'});
*/
export function translate(key, defaultValueOrOptions, options) {
  if (!i18n.isInitialized) return key;
  let defaultValue = undefined;

  if (defaultValueOrOptions instanceof String || typeof defaultValueOrOptions === 'string')
    defaultValue = defaultValueOrOptions;
  else options = defaultValueOrOptions;

  const { t } = useI18nTranslations();
  return t(key, defaultValue, options);
}

export function getI(key, defaultValueOrOptions, options) {
  return translate(key, defaultValueOrOptions, options);
}

export default translate;