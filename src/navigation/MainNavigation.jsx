import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';

import BottomTabNavigator from '../components/navigation/BottomTabNavigator';
import CourseNavigation from './main/CourseNavigation';
import GroupsNavigation from './main/GroupsNavigation';
import HomeworksNavigation from './main/HomeworksNavigation';
import WorkspaceNavigation from './main/WorkspaceNavigation';
import { navigatorNames } from './NavigationConstants';
import { translate } from '../utils/Internationalization';

const Stack = createStackNavigator();
const initialRouteName = navigatorNames.workspace;

const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 0.6],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
  },
});

const getNavigatorTabs = () => {
  return [
    {
      name: navigatorNames.workspace,
      title: translate('navigation.workspace'),
      iconName: 'home-outline',
      focusedIconName: 'home',
      component: WorkspaceNavigation,
    },
    {
      name: navigatorNames.homeworks,
      title: translate('navigation.homeworks'),
      iconName: 'document-outline',
      focusedIconName: 'document',
      component: HomeworksNavigation,
    },
    {
      name: navigatorNames.course,
      title: translate('navigation.course'),
      iconName: 'folder-outline',
      focusedIconName: 'folder',
      component: CourseNavigation,
    },
    {
      name: navigatorNames.groups,
      title: translate('navigation.groups'),
      iconName: 'people-outline',
      focusedIconName: 'people',
      component: GroupsNavigation,
    },
  ];
};

function MainNavigation() {
  const navigationRef = useNavigationContainerRef();
  const [navigatorState, setNavigatorState] = useState({
    routes: [{ name: initialRouteName, state: { index: 0, routes: [] } }],
  });

  return (
    <NavigationContainer ref={navigationRef} onStateChange={state => setNavigatorState(state)}>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: forFade,
        }}
      >
        {getNavigatorTabs().map(tab => {
          return <Stack.Screen key={tab.name} name={tab.name} component={tab.component} />;
        })}
      </Stack.Navigator>
      <BottomTabNavigator navigationState={navigatorState} navigationRef={navigationRef} navigatorTabs={getNavigatorTabs()} />
    </NavigationContainer>
  );
}

export default MainNavigation;
