import React from 'react';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import Groups, { GROUPS_SCREEN } from '../../screens/groups/Groups';

const Stack = createStackNavigator();

const GroupsNavigation = () => {
  return (
    <>
      <Stack.Navigator 
        initialRouteName={GROUPS_SCREEN} 
        screenOptions={{ ...TransitionPresets.ScaleFromCenterAndroid }}
      >
        <Stack.Screen name={GROUPS_SCREEN} component={Groups} />
      </Stack.Navigator>
    </>
  );
};

export default GroupsNavigation;
