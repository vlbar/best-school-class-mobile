import React from 'react';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';

import Course, { COURSE_SCREEN } from '../../screens/course/Course';
import ModifyTaskType, { MODIFY_TASK_TYPE_SCREEN } from '../../screens/course/ModifyTaskType';
import Tasks, { TASKS_SCREEN } from '../../screens/course/Tasks';

const Stack = createStackNavigator();

const CourseNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName={COURSE_SCREEN}
      screenOptions={{ headerShown: false, ...TransitionPresets.ScaleFromCenterAndroid }}
    >
      <Stack.Screen name={COURSE_SCREEN} component={Course} />
      <Stack.Screen name={MODIFY_TASK_TYPE_SCREEN} component={ModifyTaskType} />
      <Stack.Screen name={TASKS_SCREEN} component={Tasks} />
    </Stack.Navigator>
  );
};

export default CourseNavigation;
