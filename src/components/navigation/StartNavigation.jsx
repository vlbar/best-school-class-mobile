import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { createContext } from 'react';
import getI from '../../utils/Internationalization';

import Login from '../screens/start/Login';
import PasswordRecovery from '../screens/start/PasswordRecovery';
import Register from '../screens/start/Register';

const Stack = createNativeStackNavigator();

export const LOGIN_SCREEN = 'Login';
export const REGISTER_SCREEN = 'Register';
export const PASSWORD_RECOVERY_SCREEN = 'PasswordRecovery';

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
        </Stack.Navigator>
      </NavigationContainer>
    </TemporaryLoginContext.Provider>
  );
}

export default StartNavigation;
