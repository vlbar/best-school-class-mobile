import React from 'react';
import Button from '../../../components/common/Button';
import { StyleSheet } from 'react-native';

import Color from '../../../constants';
import Container from '../../../components/common/Container';
import Header from '../../../components/navigation/Header';
import Text from '../../../components/common/Text';
import { CHANGE_LANGUAGE_SCREEN } from './ChangeLanguage';
import { getCurrentLanguage, translate } from '../../../utils/Internationalization';

export const SETTINGS_SCREEN = 'Settings';
function Settings({ navigation }) {
  const currentLanguage = <Text style={styles.subtitle}>{getCurrentLanguage().displayName}</Text>;

  return (
    <>
      <Header title={translate('profile.settings.title')} canBack={true} />
      <Container>
        <Button
          title={translate('profile.settings.change-language.title')}
          right={currentLanguage}
          iconName="language-outline"
          color={Color.transparent}
          textColor={Color.darkGray}
          iconSize={26}
          onPress={() => navigation.navigate(CHANGE_LANGUAGE_SCREEN)}
        />
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: Color.silver,
    fontSize: 14,
  },
});

export default Settings;
