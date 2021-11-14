import React, { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  availableLanguages,
  changeLanguage,
  getCurrentLanguage,
} from '../../utils/Internationalization';
import SearchBar from '../common/SearchBar';
import Check from '../common/Check';

function LanguageSelector() {
  const currentLanguage = getCurrentLanguage();
  const availableLanguagesList = useRef(availableLanguages).current;
  const [languageList, setLanguageList] = useState(availableLanguagesList);

  const onSearchChangeHandler = value => {
    setLanguageList(
      availableLanguagesList.filter(
        x => x.displayName.toLowerCase().indexOf(value.toLowerCase()) !== -1,
      ),
    );
  };

  return (
    <View>
      <SearchBar onChange={onSearchChangeHandler} />
      <ScrollView>
        <Check.Group
          onChange={target => changeLanguage(target.name)}
          defaultValue={currentLanguage.languageName}
        >
          {languageList.map(language => {
            return (
              <Check.Item
                key={language.name}
                title={language.displayName}
                name={language.name}
                type="radio"
              />
            );
          })}
        </Check.Group>
      </ScrollView>
    </View>
  );
}

export default LanguageSelector;
