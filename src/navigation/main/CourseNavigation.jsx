import React from 'react';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import Course, { COURSE_SCREEN } from '../../screens/course/Course';
import Tasks, { TASKS_SCREEN } from '../../screens/course/Tasks';

const Stack = createStackNavigator();

const CourseNavigation = () => {
  return (
    <Stack.Navigator 
      initialRouteName={COURSE_SCREEN} 
      screenOptions={{ ...TransitionPresets.ScaleFromCenterAndroid }}
    >
      <Stack.Screen name={COURSE_SCREEN} component={Course} />
      <Stack.Screen name={TASKS_SCREEN} component={Tasks} />
    </Stack.Navigator>
  );
};

export default CourseNavigation;
