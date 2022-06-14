import React, { useEffect, useRef, useState } from 'react';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import Homeworks, { HOMEWORKS_SCREEN } from '../../screens/homeworks/Homeworks';
import HomeworkDetails, { HOMEWORKS_DETAILS_SCREEN } from '../../screens/homeworks/HomeworkDetails';
import Interview, { INTERVIEW_SCREEN } from '../../screens/homeworks/Interview';
import { HomeworkContext } from './HomeworksNavigationConstants';
import TaskAnswer, { TASK_ANSWER_SCREEN } from '../../screens/homeworks/TaskAnswer';
import TaskTry, { TASK_TRY_SCREEN } from '../../screens/homeworks/TaskTry';
import TaskEvaluation, { TASK_EVALUATION_SCREEN } from '../../screens/homeworks/TaskEvaluation';

const Stack = createStackNavigator();

const HomeworksNavigation = ({ route }) => {
  const [homework, setHomework] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [answers, setAnswers] = useState(null);
  const [answerTry, setAnswerTry] = useState([]);
  //REACT BEST STATE SAVING THANK YOU. P.S.: Говно собачье, жлоб вонючий, дерьмо, сука, падла! Иди сюда, мерзавец, негодяй, гад! Иди сюда, ты, говно, жопа!
  const answersRef = useRef(null);

  //FIXME
  //  ░░░░██╗░░░░██╗███████╗██╗██╗░░██╗███╗░░░███╗███████╗  ███████╗██████╗░░█████╗░████████╗
  //  ░░░██╔╝░░░██╔╝██╔════╝██║╚██╗██╔╝████╗░████║██╔════╝  ██╔════╝██╔══██╗██╔══██╗╚══██╔══╝
  //  ░░██╔╝░░░██╔╝░█████╗░░██║░╚███╔╝░██╔████╔██║█████╗░░  █████╗░░██████╦╝███████║░░░██║░░░
  //  ░██╔╝░░░██╔╝░░██╔══╝░░██║░██╔██╗░██║╚██╔╝██║██╔══╝░░  ██╔══╝░░██╔══██╗██╔══██║░░░██║░░░
  //  ██╔╝░░░██╔╝░░░██║░░░░░██║██╔╝╚██╗██║░╚═╝░██║███████╗  ███████╗██████╦╝██║░░██║░░░██║░░░
  //  ╚═╝░░░░╚═╝░░░░╚═╝░░░░░╚═╝╚═╝░░╚═╝╚═╝░░░░░╚═╝╚══════╝  ╚══════╝╚═════╝░╚═╝░░╚═╝░░░╚═╝░░░
  //  
  //  ██╗░░██╗██╗░░░██╗███████╗████████╗░█████╗░  ██████╗░██████╗░░█████╗░░██████╗████████╗░█████╗░
  //  ██║░░██║██║░░░██║██╔════╝╚══██╔══╝██╔══██╗  ██╔══██╗██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██╔══██╗
  //  ███████║██║░░░██║█████╗░░░░░██║░░░███████║  ██████╔╝██████╔╝██║░░██║╚█████╗░░░░██║░░░██║░░██║
  //  ██╔══██║██║░░░██║██╔══╝░░░░░██║░░░██╔══██║  ██╔═══╝░██╔══██╗██║░░██║░╚═══██╗░░░██║░░░██║░░██║
  //  ██║░░██║╚██████╔╝███████╗░░░██║░░░██║░░██║  ██║░░░░░██║░░██║╚█████╔╝██████╔╝░░░██║░░░╚█████╔╝
  //  ╚═╝░░╚═╝░╚═════╝░╚══════╝░░░╚═╝░░░╚═╝░░╚═╝  ╚═╝░░░░░╚═╝░░╚═╝░╚════╝░╚═════╝░░░░╚═╝░░░░╚════╝░
  //  
  //  ██████╗░██╗░░░░░██╗░░░██╗░█████╗░████████╗  ░█████╗░██████╗░██╗███╗░░██╗░██████╗░███████╗
  //  ██╔══██╗██║░░░░░╚██╗░██╔╝██╔══██╗╚══██╔══╝  ██╔══██╗██╔══██╗██║████╗░██║██╔════╝░██╔════╝
  //  ██████╦╝██║░░░░░░╚████╔╝░███████║░░░██║░░░  ██║░░╚═╝██████╔╝██║██╔██╗██║██║░░██╗░█████╗░░
  //  ██╔══██╗██║░░░░░░░╚██╔╝░░██╔══██║░░░██║░░░  ██║░░██╗██╔══██╗██║██║╚████║██║░░╚██╗██╔══╝░░
  //  ██████╦╝███████╗░░░██║░░░██║░░██║░░░██║░░░  ╚█████╔╝██║░░██║██║██║░╚███║╚██████╔╝███████╗
  //  ╚═════╝░╚══════╝░░░╚═╝░░░╚═╝░░╚═╝░░░╚═╝░░░  ░╚════╝░╚═╝░░╚═╝╚═╝╚═╝░░╚══╝░╚═════╝░╚══════╝
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  //WHERE IS SUKA STATE
  function handleAnswer(answer) {
    setAnswers([answer, ...(answersRef.current?.filter(a => a.taskId !== answer.taskId) ?? [])]);
  }

  const groupId = route.params?.groupId;

  return (
    <HomeworkContext.Provider
      value={{
        interviews,
        setInterviews,
        tasks,
        setTasks,
        homework,
        setHomework,
        answers,
        setAnswers,
        answerTry,
        setAnswerTry,
        onAnswer: handleAnswer,
      }}
    >
      <Stack.Navigator
        initialRouteName={HOMEWORKS_SCREEN}
        screenOptions={{ headerShown: false, ...TransitionPresets.ScaleFromCenterAndroid }}
      >
        <Stack.Screen name={HOMEWORKS_SCREEN} component={Homeworks} initialParams={{ groupId }} />
        <Stack.Screen name={HOMEWORKS_DETAILS_SCREEN} component={HomeworkDetails} />
        <Stack.Screen name={INTERVIEW_SCREEN} component={Interview} />
        <Stack.Screen name={TASK_ANSWER_SCREEN} component={TaskAnswer} />
        <Stack.Screen name={TASK_TRY_SCREEN} component={TaskTry} />
        <Stack.Screen name={TASK_EVALUATION_SCREEN} component={TaskEvaluation} />
      </Stack.Navigator>
    </HomeworkContext.Provider>
  );
};

export default HomeworksNavigation;
