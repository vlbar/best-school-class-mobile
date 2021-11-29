import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { getI } from '../../utils/Internationalization';
import CreateGroup from '../screens/main/groups/CreateGroup';
import GroupDetails from '../screens/main/groups/GroupDetails';
import Groups from '../screens/main/groups/Groups';
import JoinGroup from '../screens/main/groups/JoinGroup';

const Stack = createNativeStackNavigator();

export const GROUPS_SCREEN = 'Groups';
export const GROUP_DETAILS_SCREEN = 'GroupDetails';
export const CREATE_GROUP_SCREEN = 'CreateGroup';
export const JOIN_GROUP_SCREEN = 'JoinGroup';

function GroupsNavigation() {
  return (
    <NavigationContainer
      independent
      theme={{ dark: false, colors: { background: 'white' } }}
    >
      <Stack.Navigator
        initialRouteName={GROUPS_SCREEN}
        screenOptions={{ headerShadowVisible: false }}
      >
        <Stack.Screen
          name={GROUPS_SCREEN}
          component={Groups}
          options={{
            title: 'Группы',
            headerStyle: {
              backgroundColor: 'white',
            },
          }}
        />
        <Stack.Screen
          name={CREATE_GROUP_SCREEN}
          component={CreateGroup}
          options={{
            title: 'Создать группу',
            headerStyle: {
              backgroundColor: 'white',
            },
          }}
        />
        <Stack.Screen
          name={JOIN_GROUP_SCREEN}
          component={JoinGroup}
          options={{
            title: 'Присоединиться к группе',
            headerStyle: {
              backgroundColor: 'white',
            },
          }}
        />
        <Stack.Screen
          name={GROUP_DETAILS_SCREEN}
          component={GroupDetails}
          options={{
            title: 'Чайник года + обсуждение РДС + гатс',
            headerStyle: {
              backgroundColor: 'yellow',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default GroupsNavigation;
