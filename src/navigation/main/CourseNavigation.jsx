import React from 'react';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';

import Course, { COURSE_SCREEN } from '../../screens/course/Course';
import CourseNavigationContextProvider from '../../components/course/CourseNavigationContext';
import GroupSelect, { GROUP_SELECT_SCREEN } from '../../screens/course/GroupSelect';
import ModifyHomework, { MODIFY_HOMEWORK } from '../../screens/course/ModifyHomework';
import ModifyTaskType, { MODIFY_TASK_TYPE_SCREEN } from '../../screens/course/ModifyTaskType';
import TaskEdit, { TASK_EDIT_SCREEN } from './../../screens/course/TaskEdit';
import TaskQuestions, { TASK_SCREEN } from '../../screens/course/TaskQuestions';
import TaskTypeList, { TASK_TYPE_LIST_SCREEN } from '../../screens/course/TaskTypeList';

const Stack = createStackNavigator();

const CourseNavigation = () => {
  return (
    <CourseNavigationContextProvider>
      <Stack.Navigator
        initialRouteName={COURSE_SCREEN}
        screenOptions={{ headerShown: false, ...TransitionPresets.ScaleFromCenterAndroid }}
      >
        <Stack.Screen name={COURSE_SCREEN} component={Course} />
        <Stack.Screen name={MODIFY_TASK_TYPE_SCREEN} component={ModifyTaskType} />
        <Stack.Screen name={TASK_SCREEN} component={TaskQuestions} initialParams={{ id: 91 }} />
        <Stack.Screen name={TASK_EDIT_SCREEN} component={TaskEdit} />
        <Stack.Screen name={TASK_TYPE_LIST_SCREEN} component={TaskTypeList} />
        <Stack.Screen name={MODIFY_HOMEWORK} component={ModifyHomework} />
        <Stack.Screen name={GROUP_SELECT_SCREEN} component={GroupSelect} />
      </Stack.Navigator>
    </CourseNavigationContextProvider>
  );
};

export default CourseNavigation;
