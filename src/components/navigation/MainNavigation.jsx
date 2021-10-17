import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import Workspace from '../screens/main/Workspace';
import Homeworks from '../screens/main/Homeworks';
import Courses from '../screens/main/Courses';
import Groups from '../screens/main/Groups';

export const WORKSPACE_SCREEN = 'Workspace';
export const HOMEWORKS_SCREEN = 'Homeworks';
export const COURSES_SCREEN = 'Courses';
export const GROUPS_SCREEN = 'Groups';

const Tab = createBottomTabNavigator();

function MainNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName={WORKSPACE_SCREEN}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            switch (route.name) {
              case WORKSPACE_SCREEN:
                return (
                  <Icon
                    name={'home' + (focused ? '' : '-outline')}
                    size={size}
                    color={color}
                  />
                );
              case HOMEWORKS_SCREEN:
                return (
                  <Icon
                    name={'document' + (focused ? '' : '-outline')}
                    size={size}
                    color={color}
                  />
                );
              case COURSES_SCREEN:
                return (
                  <Icon
                    name={'folder' + (focused ? '' : '-outline')}
                    size={size}
                    color={color}
                  />
                );
              case GROUPS_SCREEN:
                return (
                  <Icon
                    name={'people' + (focused ? '' : '-outline')}
                    size={size}
                    color={color}
                  />
                );
            }
          },
        })}
      >
        <Tab.Screen
          name={WORKSPACE_SCREEN}
          component={Workspace}
          options={{ title: 'Workspace' }}
        />
        <Tab.Screen
          name={HOMEWORKS_SCREEN}
          component={Homeworks}
          options={{ title: 'Homeworks' }}
        />
        <Tab.Screen
          name={COURSES_SCREEN}
          component={Courses}
          options={{ title: 'Courses' }}
        />
        <Tab.Screen
          name={GROUPS_SCREEN}
          component={Groups}
          options={{ title: 'Groups' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default MainNavigation;
