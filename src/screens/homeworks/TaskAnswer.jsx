import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';

import Button from '../../components/common/Button';
import Color from '../../constants';
import Header from '../../components/navigation/Header';
import LinkedText from '../../components/tasks/linkedText/LinkedText';
import Resource from './../../utils/Hateoas/Resource';
import ShortDate from '../../components/common/ShortDate';
import Text from '../../components/common/Text';
import User from './../../components/user/User';
import { HomeworkContext } from '../../navigation/main/HomeworksNavigationConstants';
import { TASK_TRY_SCREEN } from './TaskTry';
import { useTranslation } from '../../utils/Internationalization';
import { ProfileContext } from '../../navigation/NavigationConstants';
import { types } from '../../components/state/State';
import ConfirmationAlert from '../../components/common/ConfirmationAlert';
import Avatar from '../../components/user/Avatar';
import { TASK_EVALUATION_SCREEN } from './TaskEvaluation';

const STATUS_APPRECIATED = 'APPRECIATED';
const STATUS_NOT_APPRECIATED = 'NOT_APPRECIATED';
const STATUS_NOT_PERFORMED = 'NOT_PERFORMED';
const STATUS_PERFORMED = 'PERFORMED';
const STATUS_RETURNED = 'RETURNED';

const ANSWER_UPDATE_TIME = 10 * 1000;

export const TASK_ANSWER_SCREEN = 'taskAnswer';
function TaskAnswer({ navigation, route }) {
  const { translate } = useTranslation();
  const { state } = useContext(ProfileContext);
  const { interviews, setInterviews, tasks, answerTry, setAnswerTry, onAnswer } = useContext(HomeworkContext);
  const interview = useMemo(() => {
    return interviews.find(x => x.interviewer.id === route.params.interviewerId);
  }, [interviews]);
  const [task, setTask] = useState();

  const [isFetching, setIsFetching] = useState(false);
  const [selectedAnswerTry, setSelectedAnswerTry] = useState(undefined);
  const [tryActionPerforming, setTryActionPerforming] = useState(false);
  const [isСompleted, setIsСompleted] = useState(undefined);

  const updateTimeout = useRef();
  const ifFocused = useIsFocused();

  useEffect(() => {
    const taskId = route.params.taskId;

    const shortTask = tasks.find(t => t.id === taskId);
    setTask(shortTask);
    Resource.of(shortTask).link().fetch(setIsFetching).then(setTask);

    return () => {
      clearTimeout(updateTimeout.current);
      setAnswerTry(null);
    };
  }, []);

  useEffect(() => {
    if (ifFocused && interview && task) fetchAnswerTry();
  }, [ifFocused, task]);

  const fetchAnswerTry = () => {
    let link;

    if (interview.link('answers')) {
      link = interview.link('answers').fill('taskId', task.id).fill('size', 1).fill('role', state.name);
    } else {
      setIsСompleted(false);
      return;
    }

    link
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
      .catch(err => console.log(err));
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
      .post(taskAnswer, setTryActionPerforming)
      .then(data => {
        continueTry(data);
        onAnswer?.(data);
      })
      .catch(error => console.log('Не удалось создать ответ на задание.', error));
  };

  const continueTry = answerTry => {
    setAnswerTry(answerTry ?? selectedAnswerTry);
    navigation.navigate(TASK_TRY_SCREEN);
  };

  const interruptTry = () => {
    selectedAnswerTry
      .link()
      .put({ answerStatus: STATUS_PERFORMED, type: 'ANSWER' }, setTryActionPerforming)
      .then(() => {
        setSelectedAnswerTry({ ...selectedAnswerTry, answerStatus: STATUS_PERFORMED });
        setIsСompleted(true);
      });
  };

  const goToEvaluation = () => {
    setAnswerTry(selectedAnswerTry);
    navigation.navigate(TASK_EVALUATION_SCREEN);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        title={translate('tasks.task')}
        headerRight={state == types.TEACHER && interview && <Avatar email={interview.interviewer.email} />}
      />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text weight="bold">{task?.name}</Text>
        {task?.description?.length ? (
          <LinkedText text={task.description} style={{ marginVertical: 10 }} />
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
          </View>
        )}
      </ScrollView>
      {selectedAnswerTry?.evaluatorId &&
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
              <ShortDate date={selectedAnswerTry.editedAt} fontSize={15} style={{ marginTop: 2, marginBottom: 10 }} />
            </View>
          </View>
        )}
      {!interview?.closed && isСompleted === false && !tryActionPerforming && (
        <>
          {selectedAnswerTry === undefined && (
            <Button title={translate('homeworks.try.start')} style={styles.button} onPress={createTaskAnswer} />
          )}
          {state == types.STUDENT && selectedAnswerTry !== undefined && (
            <Button title={translate('homeworks.try.continue')} style={styles.button} onPress={() => continueTry()} />
          )}
          {state != types.STUDENT &&
            selectedAnswerTry !== undefined &&
            selectedAnswerTry?.answerStatus === STATUS_NOT_PERFORMED && (
              <ConfirmationAlert
                onConfirm={interruptTry}
                title={translate('common.confirmation')}
                text={translate('homeworks.try.interruptConfirmation')}
              >
                {({ confirm }) => (
                  <Button
                    color={Color.danger}
                    title={translate('homeworks.try.interrupt')}
                    style={styles.button}
                    onPress={confirm}
                  />
                )}
              </ConfirmationAlert>
            )}
        </>
      )}
      {!interview?.closed &&
        state != types.STUDENT &&
        selectedAnswerTry !== undefined &&
        selectedAnswerTry?.answerStatus !== STATUS_NOT_PERFORMED && (
          <Button
            title={translate(
              selectedAnswerTry?.answerStatus == STATUS_PERFORMED
                ? 'homeworks.interview.markAction'
                : 'homeworks.interview.remarkAction',
            )}
            style={styles.button}
            onPress={goToEvaluation}
          />
        )}
      {(isСompleted === undefined || tryActionPerforming) && (
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
    marginBottom: 10,
  },
  scoreBlock: {
    backgroundColor: Color.ultraLightPrimary,
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 20,
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
