import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

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

export const MAIN_NAVIGATION = 'MainNavigation';
function MainNavigation({ navigation }) {
  return (
    <>
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
      <BottomTabNavigator
        navigation={navigation}
        navigatorTabs={getNavigatorTabs()}
        initialRouteName={initialRouteName}
      />
    </>
  );
}

export default MainNavigation;
