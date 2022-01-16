import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Color from './../constants';
import Help, { HELP_SCREEN } from '../screens/profile/Help';
import MainNavigation, { MAIN_NAVIGATION } from './MainNavigation';
import Notifications, { NOTIFICATIONS_SCREEN } from '../screens/profile/Notifications';
import SettingsNavigation from './profile/SettingsNavigation';
import SidebarContent from '../components/navigation/SidebarContent';
import { ProfileContext, profileNavigatorNames } from './NavigationConstants';
import { STUDENT, types } from '../components/state/State';

const Drawer = createDrawerNavigator();

function ProfileNavigation() {
  const [user, setUser] = useState(null);
  const [state, setState] = useState(STUDENT);

  useEffect(async () => {
    await AsyncStorage.getItem('state').then(stateName => {
      let savedState = Object.values(types).find(state => state.name == stateName);
      if (savedState) setState(savedState);
    });
  }, []);

  function onStateChange(state) {
    setState(state);
    AsyncStorage.setItem('state', state.name);
  }

  const isCanOpen = navigation => {
    const state = navigation.getState();
    const tabState = state.routes[state.index].state;
    if (tabState) {
      const tabRoute = tabState.routes[tabState.index]
      return tabRoute.state?.index ? tabRoute.state.index === 0 : true
    } else return true;
  };

  return (
    <ProfileContext.Provider value={{ user, setUser, state, setState: onStateChange }}>
      <NavigationContainer theme={{ dark: false, colors: { background: Color.white } }}>
        <Drawer.Navigator
          initialRouteName={MAIN_NAVIGATION}
          drawerContent={props => <SidebarContent {...props} />}
          screenOptions={({ route, navigation }) => ({
            headerShown: false,
            drawerType: 'slide',
            swipeEdgeWidth: 320,
            swipeEnabled: isCanOpen(navigation),
          })}
        >
          <Drawer.Screen name={MAIN_NAVIGATION} component={MainNavigation} />
          <Drawer.Screen name={NOTIFICATIONS_SCREEN} component={Notifications} />
          <Drawer.Screen name={profileNavigatorNames.settings} component={SettingsNavigation} />
          <Drawer.Screen name={HELP_SCREEN} component={Help} />
        </Drawer.Navigator>
      </NavigationContainer>
    </ProfileContext.Provider>
  );
}

export default ProfileNavigation;
