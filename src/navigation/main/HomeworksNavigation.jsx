import React from 'react';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import Homeworks, { HOMEWORKS_SCREEN } from '../../screens/homeworks/Homeworks';

const Stack = createStackNavigator();

const HomeworksNavigation = () => {
  return (
    <>
      <Stack.Navigator
        initialRouteName={HOMEWORKS_SCREEN}
        screenOptions={{ ...TransitionPresets.ScaleFromCenterAndroid }}
      >
        <Stack.Screen name={HOMEWORKS_SCREEN} component={Homeworks} />
      </Stack.Navigator>
    </>
  );
};

export default HomeworksNavigation;
