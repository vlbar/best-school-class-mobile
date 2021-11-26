import React, { createContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import Confirmation, { CONFIRMATION_SCREEN } from '../screens/start/Confirmation';
import Login, { LOGIN_SCREEN } from '../screens/start/Login';
import PasswordChange, { PASSWORD_RESET_SCREEN } from '../screens/start/PasswordChange';
import PasswordRecovery, { PASSWORD_RECOVERY_SCREEN } from '../screens/start/PasswordRecovery';
import Register, { REGISTER_SCREEN } from '../screens/start/Register';
import { getI } from './../utils/Internationalization';

const Stack = createStackNavigator();

export const TemporaryLoginContext = createContext();

function StartNavigation({ onLoginSuccess }) {
  return (
    <TemporaryLoginContext.Provider value={{ onLoginSuccess }}>
      <NavigationContainer
        theme={{ dark: false, colors: { background: 'white' } }}
      >
        <Stack.Navigator
          initialRouteName={LOGIN_SCREEN}
          screenOptions={{ headerShadowVisible: false }}
        >
          <Stack.Screen
            name={LOGIN_SCREEN}
            component={Login}
            options={{
              title: getI('login.title', 'Вход'),
              headerShown: false,
            }}
          />
          <Stack.Screen
            name={REGISTER_SCREEN}
            component={Register}
            options={{
              title: getI('register.title', 'Регистрация'),
              headerShown: false,
            }}
          />
          <Stack.Screen
            name={PASSWORD_RECOVERY_SCREEN}
            component={PasswordRecovery}
            options={{
              title: getI('password-recovery.title', 'Восстановление пароля'),
              headerShown: false,
            }}
          />
          <Stack.Screen
            name={CONFIRMATION_SCREEN}
            component={Confirmation}
            options={{
              title: getI('confirmation.title'),
              headerShown: false,
            }}
          />
          <Stack.Screen
            name={PASSWORD_RESET_SCREEN}
            component={PasswordChange}
            options={{
              title: getI('password-change.title'),
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </TemporaryLoginContext.Provider>
  );
}

export default StartNavigation;
