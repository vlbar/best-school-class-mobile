import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';

import Button from '../../components/common/Button';
import Color from '../../constants';
import Header from '../../components/navigation/Header';
import Text from '../../components/common/Text';
import { HomeworkContext } from '../../navigation/main/HomeworksNavigationConstants';
import { useTranslation } from '../../utils/Internationalization';
import { clearHtmlTags } from '../../utils/TextUtils';

const STATUS_APPRECIATED = 'APPRECIATED';
const STATUS_NOT_APPRECIATED = 'NOT_APPRECIATED';
const STATUS_NOT_PERFORMED = 'NOT_PERFORMED';
const STATUS_PERFORMED = 'PERFORMED';
const STATUS_RETURNED = 'RETURNED';

const ANSWER_UPDATE_TIME = 10 * 1000;

export const TASK_ANSWER_SCREEN = 'taskAnswer';
function TaskAnswer({ navigation, route }) {
  const { translate } = useTranslation();
  const { interviews, tasks, setAnswerTry } = useContext(HomeworkContext);
  const [interview, setInterview] = useState();
  const [task, setTask] = useState();

  const [selectedAnswerTry, setSelectedAnswerTry] = useState(undefined);
  const [isCreatingTry, setIsCreatingTry] = useState(false);
  const [isСompleted, setIsСompleted] = useState(false);

  const updateTimeout = useRef();
  const ifFocused = useIsFocused();

  useEffect(() => {
    const taskId = route.params.taskId;
    const interviewId = route.params.interviewId;
    setInterview(interviews.find(x => x.id === interviewId));
    setTask(tasks.find(t => t.id === taskId));

    return () => {
      clearTimeout(updateTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (ifFocused && interview && task) fetchAnswerTry();
  }, [ifFocused, interview]);

  const fetchAnswerTry = () => {
    interview
      .link('answers')
      .fill('taskId', task.id)
      .fill('size', 1)
      .fetch()
      .then(data => {
        if (data.page.totalElements > 0) {
          const targetAnswerTry = data.list('messages')[0];
          switch (targetAnswerTry.answerStatus) {
            case STATUS_NOT_PERFORMED:
              setSelectedAnswerTry(targetAnswerTry);
              setIsСompleted(false);
              break;
            case STATUS_RETURNED:
            case STATUS_NOT_APPRECIATED:
              setSelectedAnswerTry(null);
              setIsСompleted(false);
              break;
            default:
              setIsСompleted(true);
              break;
          }
        } else {
          setIsСompleted(true);
        }
        updateAnswerTryOvertime();
      })
      .catch(err => log(err));
  };

  const updateAnswerTryOvertime = () => {
    clearTimeout(updateTimeout.current);
    updateTimeout.current = setTimeout(() => {
      fetchAnswerTry();
    }, ANSWER_UPDATE_TIME);
  };

  const createTaskAnswer = () => {
    let taskAnswer = {
      type: 'ANSWER',
      taskId: task.id,
    };

    interview
      .link('interviewMessages')
      .post(taskAnswer, setIsCreatingTry)
      .then(data => {
        continueTry(data);
      })
      .catch(error => console.log('Не удалось создать ответ на задание.', error));
  };

  const continueTry = answerTry => {
    setAnswerTry(answerTry ?? selectedAnswerTry);
    //navigation.navigate(TASK_TRY_SCREEN);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title={translate('tasks.task')} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text weight="bold">{task?.name}</Text>
        <Text style={{ marginVertical: 10 }}>{clearHtmlTags(task?.description)}</Text>
        <View style={styles.row}>
          <Text>{translate('tasks.edit.duration')}</Text>
          <Text weight="bold">
            {task?.duration
              ? moment.utc(task?.duration * 60000 ?? 0).format('hh:mm')
              : translate('homeworks.try.infinity')}
          </Text>
        </View>
        <View style={styles.row}>
          <Text>{translate('tasks.edit.maxScore')}</Text>
          <Text weight="bold">{task?.maxScore}</Text>
        </View>
      </ScrollView>
      {!isСompleted && (
        <>
          {selectedAnswerTry === undefined || isCreatingTry ? (
            <ActivityIndicator color={Color.primary} size={50} style={{ marginBottom: 10 }} />
          ) : (
            <>
              {selectedAnswerTry === null && (
                <Button title={translate('homeworks.try.start')} style={styles.button} onPress={createTaskAnswer} />
              )}
              {selectedAnswerTry !== null && (
                <Button
                  title={translate('homeworks.try.continue')}
                  style={styles.button}
                  onPress={() => continueTry()}
                />
              )}
            </>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
});

export default TaskAnswer;
