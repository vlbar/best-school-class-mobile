import React, { createContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import Login from '../screens/start/Login';
import Register from '../screens/start/Register';

const Stack = createStackNavigator();

export const LOGIN_SCREEN = 'Login';
export const REGISTER_SCREEN = 'Register';

export const TemporaryLoginContext = createContext();

function StartNavigation({ onLoginSuccess }) {
  return (
    <TemporaryLoginContext.Provider value={{ onLoginSuccess }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={LOGIN_SCREEN}>
          <Stack.Screen
            name={LOGIN_SCREEN}
            component={Login}
            options={{ title: 'Login' }}
          />
          <Stack.Screen
            name={REGISTER_SCREEN}
            component={Register}
            options={{ title: 'Register' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </TemporaryLoginContext.Provider>
  );
}

export default StartNavigation;
