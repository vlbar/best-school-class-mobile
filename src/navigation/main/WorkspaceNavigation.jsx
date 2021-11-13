import React from 'react';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import Workspace, { WORKSPACE_SCREEN } from '../../screens/workspace/Workspace';

const Stack = createStackNavigator();

const WorkspaceNavigation = () => {
  return (
    <>
      <Stack.Navigator
        initialRouteName={WORKSPACE_SCREEN}
        screenOptions={{ ...TransitionPresets.ScaleFromCenterAndroid }}
      >
        <Stack.Screen name={WORKSPACE_SCREEN} component={Workspace} />
      </Stack.Navigator>
    </>
  );
};

export default WorkspaceNavigation;
