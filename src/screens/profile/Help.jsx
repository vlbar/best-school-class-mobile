import React from 'react';

import Text from '../../components/common/Text';
import Container from '../../components/common/Container';
import Header from './../../components/navigation/Header';
import { translate } from '../../utils/Internationalization';
import Button from '../../components/common/Button';
import Color from './../../constants';
import { Linking, StyleSheet } from 'react-native';

const websiteUrl = 'https://bestschoolclass.herokuapp.com';

export const HELP_SCREEN = 'help';
function Help() {
  const openUrl = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
      else console.log("Don't know how to open URI: " + url);
    });
  };

  return (
    <>
      <Header title={translate('profile.help.title')} />
      <Container>
        <Button
          title={translate('profile.help.website')}
          iconName="browsers-outline"
          color={Color.transparent}
          textColor={Color.darkGray}
          iconSize={26}
          onPress={() => openUrl(websiteUrl)}
        />
        <Button
          title={translate('profile.help.send-issue')}
          iconName="bug-outline"
          color={Color.transparent}
          textColor={Color.darkGray}
          iconSize={26}
          onPress={() => openUrl('https://github.com/vlbar/best-school-class-mobile/issues')}
        />
        <Button
          title={translate('profile.help.help-center')}
          iconName="help-buoy-outline"
          color={Color.transparent}
          textColor={Color.darkGray}
          iconSize={26}
          onPress={() => {}}
        />
        <Button
          title={translate('profile.help.privacy')}
          iconName="lock-closed-outline"
          color={Color.transparent}
          textColor={Color.darkGray}
          iconSize={26}
          onPress={() => openUrl(websiteUrl + '/privacy.html')}
        />
        <Text style={styles.version}>Best School Class v{'0.0.1'}</Text>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  version: {
    fontSize: 14,
    color: Color.silver,
    marginTop: 10,
  },
});

export default Help;
