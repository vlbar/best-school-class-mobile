import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';

import Button from '../../components/common/Button';
import Color from '../../constants';
import Header from '../../components/navigation/Header';
import Resource from './../../utils/Hateoas/Resource';
import ShortDate from '../../components/common/ShortDate';
import Text from '../../components/common/Text';
import User from './../../components/user/User';
import { HomeworkContext } from '../../navigation/main/HomeworksNavigationConstants';
import { TASK_TRY_SCREEN } from './TaskTry';
import { clearHtmlTags } from '../../utils/TextUtils';
import { useTranslation } from '../../utils/Internationalization';

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

  const [isFetching, setIsFetching] = useState(false);
  const [selectedAnswerTry, setSelectedAnswerTry] = useState(undefined);
  const [isCreatingTry, setIsCreatingTry] = useState(false);
  const [isСompleted, setIsСompleted] = useState(undefined);

  const updateTimeout = useRef();
  const ifFocused = useIsFocused();

  useEffect(() => {
    const taskId = route.params.taskId;
    const interviewId = route.params.interviewId;
    setInterview(interviews.find(x => x.id === interviewId));

    const shortTask = tasks.find(t => t.id === taskId);
    setTask(shortTask);
    Resource.of(shortTask).link().fetch(setIsFetching).then(setTask);

    return () => {
      clearTimeout(updateTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (ifFocused && interview && task) fetchAnswerTry();
  }, [ifFocused, task]);

  const fetchAnswerTry = () => {
    interview
      .link('answers')
      .fill('taskId', task.id)
      .fill('size', 1)
      .fetch()
      .then(data => {
        if (data.page.totalElements > 0) {
          const targetAnswerTry = data.list('messages')[0];
          setSelectedAnswerTry(targetAnswerTry);
          switch (targetAnswerTry.answerStatus) {
            case STATUS_NOT_PERFORMED:
              setIsСompleted(false);
              break;
            case STATUS_RETURNED:
              setIsСompleted(false);
              break;
            default:
              setIsСompleted(true);
              break;
          }
        } else {
          setIsСompleted(false);
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
    navigation.navigate(TASK_TRY_SCREEN);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title={translate('tasks.task')} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text weight="bold">{task?.name}</Text>
        {task?.description?.length ? (
          <Text style={{ marginVertical: 10 }}>{clearHtmlTags(task?.description)}</Text>
        ) : (
          <Text color={Color.silver} style={{ marginVertical: 10 }}>
            {translate('tasks.noDescription')}
          </Text>
        )}
        <View style={styles.row}>
          <Text weight="bold">{translate('tasks.edit.duration')}</Text>
          <Text style={styles.infoText}>
            {task?.duration ? (
              <>
                {task.duration !== null
                  ? moment.duration(task?.duration * 60 * 1000 ?? 0).humanize()
                  : translate('homeworks.try.infinity')}
              </>
            ) : (
              <ActivityIndicator size={20} color={Color.primary} />
            )}
          </Text>
        </View>
        <View style={styles.row}>
          <Text weight="bold">{translate('tasks.edit.maxScore')}</Text>
          <Text style={styles.infoText}>{task?.maxScore}</Text>
        </View>

        {selectedAnswerTry && (
          <View style={{ marginTop: 20 }}>
            <View style={styles.row}>
              <Text weight="bold">{translate('homeworks.try.started')}</Text>
              <ShortDate date={selectedAnswerTry.submittedAt} style={styles.infoText} />
            </View>
            {selectedAnswerTry.answerStatus != STATUS_NOT_PERFORMED && (
              <>
                <View style={styles.row}>
                  <Text weight="bold">{translate('homeworks.try.finished')}</Text>
                  <ShortDate date={selectedAnswerTry.completionDate} style={styles.infoText} />
                </View>
                <View style={styles.row}>
                  <Text weight="bold">{translate('homeworks.try.runtime')}</Text>
                  <Text style={styles.infoText}>{moment.duration(selectedAnswerTry.totalDuration).humanize()}</Text>
                </View>
              </>
            )}
            {selectedAnswerTry.completionDate >= new Date().getTime() && (
              <View style={styles.row}>
                <Text weight="bold">{translate('homeworks.try.timeLeft')}</Text>
                <Text style={styles.infoText}>
                  {moment.duration(selectedAnswerTry.completionDate - new Date().getTime()).humanize()}
                </Text>
              </View>
            )}
            {selectedAnswerTry.evaluatorId &&
              selectedAnswerTry.answerStatus != STATUS_NOT_PERFORMED &&
              selectedAnswerTry.answerStatus != STATUS_PERFORMED && (
                <View style={styles.scoreBlock}>
                  <View style={styles.row}>
                    {selectedAnswerTry.answerStatus == STATUS_APPRECIATED && (
                      <Text weight="bold">{translate('homeworks.try.appreciated')}</Text>
                    )}
                    {selectedAnswerTry.answerStatus == STATUS_NOT_APPRECIATED && (
                      <Text weight="bold">{translate('homeworks.try.notAppreciated')}</Text>
                    )}
                    {selectedAnswerTry.answerStatus == STATUS_RETURNED && (
                      <Text weight="bold">{translate('homeworks.try.returned')}</Text>
                    )}
                    <View>
                      {selectedAnswerTry.answerStatus == 'APPRECIATED' && (
                        <Text weight="bold">
                          {selectedAnswerTry.score}/{task.maxScore}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={[styles.row, { flexWrap: 'wrap' }]}>
                    <View style={{ flexShrink: 1, marginBottom: 10 }}>
                      <User short userId={selectedAnswerTry.evaluatorId} />
                    </View>
                    <ShortDate
                      date={selectedAnswerTry.editedAt}
                      fontSize={15}
                      style={{ marginTop: 2, marginBottom: 10 }}
                    />
                  </View>
                </View>
              )}
          </View>
        )}
      </ScrollView>
      {isСompleted === false && !isCreatingTry && (
        <>
          {selectedAnswerTry === undefined && (
            <Button title={translate('homeworks.try.start')} style={styles.button} onPress={createTaskAnswer} />
          )}
          {selectedAnswerTry !== undefined && (
            <Button title={translate('homeworks.try.continue')} style={styles.button} onPress={() => continueTry()} />
          )}
        </>
      )}
      {(isСompleted === undefined || isCreatingTry) && (
        <ActivityIndicator color={Color.primary} size={50} style={{ marginBottom: 10 }} />
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
  scoreBlock: {
    backgroundColor: Color.ultraLightPrimary,
    marginTop: 20,
    paddingHorizontal: 14,
    paddingTop: 0,
    borderRadius: 10,
    paddingBottom: 2,
  },
  infoText: {
    color: Color.silver,
    marginLeft: 3,
    textAlign: 'right',
  },
});

export default TaskAnswer;
