import React from 'react';
import Color from '../../constants';
import { StyleSheet, View } from 'react-native';

import Button from './../common/Button';
import Check from './../common/Check';
import SidebarHeader from './../sidebar/SidebarHeader';
import { HELP_SCREEN } from './../../screens/profile/Help';
import { NOTIFICATIONS_SCREEN } from './../../screens/profile/Notifications';
import { profileNavigatorNames } from '../../navigation/NavigationConstants';
import { translate } from '../../utils/Internationalization';

function SidebarContent({ navigation }) {
  const notificationSwitch = <Check type="switch" style={styles.notificationSwitch} />;

  const sidebarMenus = [
    {
      title: translate('sidebar.calendar'),
      iconName: 'calendar-outline',
      screen: HELP_SCREEN,
    },
    {
      title: translate('sidebar.notifications'),
      iconName: 'notifications-outline',
      right: notificationSwitch,
      screen: NOTIFICATIONS_SCREEN,
    },
    {
      title: translate('sidebar.settings'),
      iconName: 'settings-outline',
      screen: profileNavigatorNames.settings,
    },
    {
      title: translate('sidebar.help'),
      iconName: 'help-outline',
      screen: HELP_SCREEN,
    },
  ];

  const onMenuPress = menu => {
    navigation.navigate(menu.screen);
  };

  const onLogout = () => {
    console.log('logged out :/');
  };

  return (
    <>
      <SidebarHeader navigation={navigation} />
      <View style={styles.sidebarContainer}>
        <View>
          {sidebarMenus.map(menu => (
            <Button
              key={menu.title}
              color={Color.transparent}
              textColor={Color.darkGray}
              iconSize={26}
              {...menu}
              onPress={() => onMenuPress(menu)}
            />
          ))}
        </View>
        <Button
          title={translate('sidebar.logout')}
          iconName="exit-outline"
          color={Color.transparent}
          textColor={Color.darkGray}
          iconSize={26}
          onPress={onLogout}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sidebarContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});

export default SidebarContent;
