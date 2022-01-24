import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import Confirmation, { CONFIRMATION_SCREEN } from '../screens/start/Confirmation';
import Login, { LOGIN_SCREEN } from '../screens/start/Login';
import PasswordChange, { PASSWORD_RESET_SCREEN } from '../screens/start/PasswordChange';
import PasswordRecovery, { PASSWORD_RECOVERY_SCREEN } from '../screens/start/PasswordRecovery';
import Register, { REGISTER_SCREEN } from '../screens/start/Register';
import LanguageSelect, { LANGUAGE_SELECT_SCREEN } from '../screens/start/LanguageSelect';

const Stack = createStackNavigator();

function StartNavigation() {
  return (
    <NavigationContainer theme={{ dark: false, colors: { background: 'white' } }}>
      <Stack.Navigator
        initialRouteName={LOGIN_SCREEN}
        screenOptions={{ headerShown: false, ...TransitionPresets.ScaleFromCenterAndroid }}
      >
        <Stack.Screen name={LOGIN_SCREEN} component={Login} />
        <Stack.Screen name={REGISTER_SCREEN} component={Register} />
        <Stack.Screen name={PASSWORD_RECOVERY_SCREEN} component={PasswordRecovery} />
        <Stack.Screen name={CONFIRMATION_SCREEN} component={Confirmation} />
        <Stack.Screen name={PASSWORD_RESET_SCREEN} component={PasswordChange} />
        <Stack.Screen name={LANGUAGE_SELECT_SCREEN} component={LanguageSelect} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default StartNavigation;
