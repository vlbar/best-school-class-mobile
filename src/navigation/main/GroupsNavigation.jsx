import React from 'react';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import Groups, { GROUPS_SCREEN } from '../../screens/groups/Groups';
import GroupDetails, { GROUPS_DETAILS_SCREEN } from '../../screens/groups/GroupDetails';
import CreateGroup, { CREATE_GROUP_SCREEN } from '../../screens/groups/CreateGroup';
import JoinGroup, { JOIN_GROUP_SCREEN } from '../../screens/groups/JoinGroup';

const Stack = createStackNavigator();

const GroupsNavigation = () => {
  return (
    <>
      <Stack.Navigator
        initialRouteName={GROUPS_SCREEN}
        screenOptions={{ headerShown: false, ...TransitionPresets.ScaleFromCenterAndroid }}
        
      >
        <Stack.Screen name={GROUPS_SCREEN} component={Groups} />
        <Stack.Screen name={GROUPS_DETAILS_SCREEN} component={GroupDetails} />
        <Stack.Screen name={CREATE_GROUP_SCREEN} component={CreateGroup} />
        <Stack.Screen name={JOIN_GROUP_SCREEN} component={JoinGroup} />
      </Stack.Navigator>
    </>
  );
};

export default GroupsNavigation;
