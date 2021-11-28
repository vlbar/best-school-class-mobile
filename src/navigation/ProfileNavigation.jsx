import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import Color from './../constants';
import Help, { HELP_SCREEN } from '../screens/profile/Help';
import MainNavigation, { MAIN_NAVIGATION } from './MainNavigation';
import Notifications, { NOTIFICATIONS_SCREEN } from '../screens/profile/Notifications';
import SettingsNavigation from './profile/SettingsNavigation';
import SidebarContent from '../components/navigation/SidebarContent';
import { profileNavigatorNames } from './NavigationConstants';

const Drawer = createDrawerNavigator();

function ProfileNavigation() {
  return (
    <NavigationContainer theme={{ dark: false, colors: { background: Color.white } }}>
      <Drawer.Navigator
        initialRouteName={MAIN_NAVIGATION}
        drawerContent={props => <SidebarContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: 'slide',
          swipeEdgeWidth: 320,
        }}
      >
        <Drawer.Screen name={MAIN_NAVIGATION} component={MainNavigation} />
        <Drawer.Screen name={NOTIFICATIONS_SCREEN} component={Notifications} />
        <Drawer.Screen name={profileNavigatorNames.settings} component={SettingsNavigation} />
        <Drawer.Screen name={HELP_SCREEN} component={Help} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default ProfileNavigation;
