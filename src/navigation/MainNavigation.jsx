import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Color from '../constants';
import CourseNavigation from './main/CourseNavigation';
import GroupsNavigation from './main/GroupsNavigation';
import HomeworksNavigation from './main/HomeworksNavigation';
import WorkspaceNavigation from './main/WorkspaceNavigation';
import { navigatorNames } from './NavigationConstants';
import { translate } from '../utils/Internationalization';

const initialRouteName = navigatorNames.workspace;

// только спрашивайте потом, почему undefined... прошу...
const isTabBarVisible = navigation => {
  const state = navigation.getState()
  const currentRoute = state.routes[state.index];
  return currentRoute.state?.index ? currentRoute.state.index === 0 : true;
};

const Tab = createBottomTabNavigator();

export const MAIN_NAVIGATION = 'MainNavigation';
function MainNavigation({ navigation }) {
  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route, navigation }) => ({
        showHeader: false,
        tabBarVisible: isTabBarVisible(navigation),
        tabBarIcon: ({ focused, color, size }) => {
          switch (route.name) {
            case navigatorNames.workspace:
              return <Icon name={'home' + (focused ? '' : '-outline')} size={size} color={color} />;
            case navigatorNames.homeworks:
              return <Icon name={'document' + (focused ? '' : '-outline')} size={size} color={color} />;
            case navigatorNames.course:
              return <Icon name={'folder' + (focused ? '' : '-outline')} size={size} color={color} />;
            case navigatorNames.groups:
              return <Icon name={'people' + (focused ? '' : '-outline')} size={size} color={color} />;
          }
        },
      })}
      tabBarOptions={{
        activeLabelStyle: { color: Color.primary },
        style: { backgroundColor: Color.white },
        activeTintColor: Color.primary,
        inactiveTintColor: Color.silver,
      }}
    >
      <Tab.Screen
        name={navigatorNames.workspace}
        component={WorkspaceNavigation}
        options={{ title: translate('navigation.workspace') }}
      />
      <Tab.Screen
        name={navigatorNames.homeworks}
        component={HomeworksNavigation}
        options={{ title: translate('navigation.homeworks') }}
      />
      <Tab.Screen
        name={navigatorNames.course}
        component={CourseNavigation}
        options={{ title: translate('navigation.course') }}
      />
      <Tab.Screen
        name={navigatorNames.groups}
        component={GroupsNavigation}
        options={{ title: translate('navigation.groups') }}
      />
    </Tab.Navigator>
  );
}

export default MainNavigation;
