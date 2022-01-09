import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, View } from 'react-native';

import Color from '../../constants';
import Header from './../../components/navigation/Header';
import IconButton from '../../components/common/IconButton';
import QuestionList from '../../components/tasks/edit/QuestionList';
import Resource from './../../utils/Hateoas/Resource';
import { CourseNavigationContext, useOnBackCatcher } from '../../components/course/CourseNavigationContext';
import { TASK_EDIT_SCREEN } from './TaskEdit';
import { useTranslation } from './../../utils/Internationalization';

const baseUrl = '/v1/tasks';
const getTaskLink = id => Resource.basedOnHref(`${baseUrl}/${id}`).link();

export const TASK_SCREEN = 'task';
function TaskQuestions({ navigation, route }) {
  const { id } = route.params;
  const [task, setTask] = useState();
  const [isSaving, setIsSaving] = useState(false);

  const { contextTask, setContextTask } = useContext(CourseNavigationContext);
  const waitBackFromDetails = useOnBackCatcher(onBackFromDetails);

  const { translate } = useTranslation();

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = () => {
    getTaskLink(id)
      .fetch()
      .then(res => {
        setTask(res);
      })
      .catch(err => console.error(err));
  };

  const onEditTaskDetails = () => {
    setContextTask(task);
    waitBackFromDetails();
    navigation.navigate(TASK_EDIT_SCREEN);
  };

  function onBackFromDetails() {
    setTask(contextTask);
  }

  const onBack = () => {
    return !isSaving;
  };

  const headerContent = (
    <View style={{ flexDirection: 'row' }}>
      {task && <IconButton name="settings-outline" onPress={onEditTaskDetails} />}
      {isSaving ? (
        <ActivityIndicator color={Color.primary} style={{ marginHorizontal: 10 }} />
      ) : (
        <IconButton name="checkmark-outline" onPress={() => navigation.goBack()} />
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title={task ? task.name : translate('task.loading-title')} headerRight={headerContent} onBack={onBack} />
      <QuestionList taskId={id} setIsSaving={setIsSaving} />
    </SafeAreaView>
  );
}

export default TaskQuestions;
