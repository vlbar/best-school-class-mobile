import React, { useEffect, useState } from 'react';

import Header from './../../components/navigation/Header';
import { SafeAreaView, View } from 'react-native';
import { useTranslation } from './../../utils/Internationalization';
import IconButton from '../../components/common/IconButton';
import QuestionList from '../../components/tasks/edit/QuestionList';
import Resource from './../../utils/Hateoas/Resource';

const baseUrl = '/v1/tasks';
const getTaskLink = id => Resource.basedOnHref(`${baseUrl}/${id}`).link();

export const TASK_SCREEN = 'task';
function TaskQuestions({ route }) {
  const { translate } = useTranslation();
  const [task, setTask] = useState();
  const { id } = route.params;

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

  const headerContent = (
    <View style={{ flexDirection: 'row' }}>
      <IconButton name="settings-outline" />
      <IconButton name="checkmark-outline" />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title={task ? task.name : translate('task.loading-title')} headerRight={headerContent} />
      <QuestionList taskId={id} />
    </SafeAreaView>
  );
}

export default TaskQuestions;
