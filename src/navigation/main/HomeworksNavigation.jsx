import React, { useState } from 'react';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import Homeworks, { HOMEWORKS_SCREEN } from '../../screens/homeworks/Homeworks';
import HomeworkDetails, { HOMEWORKS_DETAILS_SCREEN } from '../../screens/homeworks/HomeworkDetails';
import Interview, { INTERVIEW_SCREEN } from '../../screens/homeworks/Interview';
import { HomeworkContext } from './HomeworksNavigationConstants';

const Stack = createStackNavigator();

const HomeworksNavigation = () => {
  const [homework, setHomework] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [tasks, setTasks] = useState([]);
  return (
    <HomeworkContext.Provider value={{ interviews, setInterviews, tasks, setTasks, homework, setHomework }}>
      <Stack.Navigator
        initialRouteName={HOMEWORKS_SCREEN}
        screenOptions={{ headerShown: false, ...TransitionPresets.ScaleFromCenterAndroid }}
      >
        <Stack.Screen name={HOMEWORKS_SCREEN} component={Homeworks} />
        <Stack.Screen name={HOMEWORKS_DETAILS_SCREEN} component={HomeworkDetails} />
        <Stack.Screen name={INTERVIEW_SCREEN} component={Interview} />
      </Stack.Navigator>
    </HomeworkContext.Provider>
  );
};

export default HomeworksNavigation;
