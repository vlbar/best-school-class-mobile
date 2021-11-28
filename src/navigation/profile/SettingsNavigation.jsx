import React from 'react';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';

import Settings, { SETTINGS_SCREEN } from '../../screens/profile/settings/Settings';
import ChangeLanguage, { CHANGE_LANGUAGE_SCREEN } from '../../screens/profile/settings/ChangeLanguage';

const Stack = createStackNavigator();

const SettingsNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName={SETTINGS_SCREEN}
      screenOptions={{ headerShown: false, ...TransitionPresets.ScaleFromCenterAndroid }}
    >
      <Stack.Screen name={SETTINGS_SCREEN} component={Settings} />
      <Stack.Screen name={CHANGE_LANGUAGE_SCREEN} component={ChangeLanguage} />
    </Stack.Navigator>
  );
};

export default SettingsNavigation;
