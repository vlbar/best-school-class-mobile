import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import moment from 'moment';

import Button from './../../components/common/Button';
import Color from '../../constants';
import Header from '../../components/navigation/Header';
import IconButton from '../../components/common/IconButton';
import ProgressBar from '../../components/common/ProgressBar';
import QuestionAnswer from '../../components/homeworks/questionTypes/QuestionAnswer';
import QuestionContentsPopup from '../../components/homeworks/QuestionContentsPopup';
import Resource from '../../utils/Hateoas/Resource';
import Text from '../../components/common/Text';
import useIsKeyboardShow from '../../utils/useIsKeyboardShow';
import { ButtonedConfirmationAlert } from '../../components/common/ConfirmationAlert';
import { HomeworkContext } from '../../navigation/main/HomeworksNavigationConstants';
import { isEquivalent } from './../../components/tasks/edit/useQuestionSaveManager';
import { useTranslation } from '../../utils/Internationalization';

const UPDATE_TIME_LEFT_INTERVAL = 10 * 1000;
const AUTO_FETCHING_THRESHOLD = 5;

const STATUS_PERFORMED = 'PERFORMED';

const answerLink = (answersId, questironsId) =>
  Resource.basedOnHref(`v1/answers/${answersId}/questions/${questironsId}/answer`).link();

export const TASK_TRY_SCREEN = 'taskTry';
function TaskTry({ navigation }) {
  const { translate } = useTranslation();
  const { answerTry, setAnswerTry } = useContext(HomeworkContext);
  const isKeyboardShow = useIsKeyboardShow();

  const [questionIndex, setQuestionIndex] = useState(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [isHasErrors, setIsHasErrors] = useState(false);
  const [questions, setQuestions] = useState([]);
  const previousAnswers = useRef(new Map());
  const nextPage = useRef();

  const [total, setTotal] = useState(1);
  const [currentProgress, setCurrentProgress] = useState(answerTry.answeredQuestionCount);

  const [secondsLeft, setSecondsLeft] = useState();
  const timeLeftInterval = useRef();

  const [isConfrimPerformShow, setIsConfrimPerformShow] = useState(false);
  const [isCompeted, setIsCompeted] = useState(false);
  const [completionModalState, setCompletionModalState] = useState(modalStateConst.NONE);
  const [isContentsPopupShow, setIsContentsPopupShow] = useState(false);
  const [isOutsideAnswerStatus, setIsOutsideAnswerStatus] = useState(false);

  const questionAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef();

  useEffect(() => {
    fetchQuestions(answerTry.link('questions'));

    setSecondsLeft(formatTime(getSecondsLeft() + 60000));
    timeLeftInterval.current = setInterval(() => {
      let currentSeconds = getSecondsLeft();
      callTimerEvents(currentSeconds);
      setSecondsLeft(formatTime(currentSeconds + 60000));
      checkAnswerStatus();
    }, UPDATE_TIME_LEFT_INTERVAL);
    return () => clearInterval(timeLeftInterval.current);
  }, []);

  const checkAnswerStatus = () => {
    answerTry
      .link()
      .fetch()
      .then(data => {
        console.log(data);
        if (data.answerStatus !== 'NOT_PERFORMED') {
          completeAnswer();
          setIsOutsideAnswerStatus(true);
        }
      });
  };

  const callTimerEvents = secondsLeft => {
    if (secondsLeft <= 0) {
      completeAnswer();
    }
  };

  const getSecondsLeft = () => {
    return answerTry.completionDate - new Date().getTime();
  };

  const fetchQuestions = link => {
    if (isCompeted) return;

    link
      ?.fetch(setIsFetching)
      .then(data => {
        const fetchedQuestions = data.list('questions') ?? [];
        nextPage.current = data.link('next');

        fetchedQuestions.forEach(question => {
          if (question.questionAnswer !== null) previousAnswers.current.set(question.id, question.questionAnswer);
        });

        if (data.page.number == 1) {
          setQuestions(fetchedQuestions);
          if (questionIndex === undefined) setQuestionIndex(0);

          setTotal(data.page.totalElements);
        } else setQuestions([...questions, ...fetchedQuestions]);
        setIsHasErrors(false);
      })
      .catch(error => {
        console.log('Не удалось загрузить список вопросов.', error);
        setIsHasErrors(true);
      });
  };

  const manageAnswer = async question => {
    const currentAnswer = question.questionAnswer;
    const prevAnswer = previousAnswers.current.get(question.id);
    let isSuccess = false;

    if (prevAnswer) {
      const merdegNew = { ...prevAnswer, ...currentAnswer };
      if (!isEquivalent(prevAnswer, merdegNew)) {
        await answerLink(answerTry.id, question.questionVariant.id)
          .put(merdegNew)
          .then(data => {
            isSuccess = true;
            previousAnswers.current.set(question.id, data);
          })
          .catch(err => console.log(err));
      } else {
        isSuccess = true;
      }
    } else {
      if (currentAnswer === null || currentAnswer.isHasChanges !== true) return true;
      const answerToAdd = { ...currentAnswer, type: question.questionVariant.type, questionId: question.id };
      await answerLink(answerTry.id, question.questionVariant.id)
        .post(answerToAdd)
        .then(data => {
          isSuccess = true;
          previousAnswers.current.set(question.id, data);
        })
        .catch(err => console.log(err));
    }

    return isSuccess;
  };

  const fetchNextPage = () => {
    fetchQuestions(nextPage.current);
  };

  const refresh = () => {
    setIsHasErrors(false);
    if (questions.length) fetchNextPage();
    else fetchQuestions(answerTry.link('questions'));
  };

  // competion
  const completeAnswer = () => {
    setIsCompeted(true);
    clearInterval(timeLeftInterval.current);
    setCompletionModalState(modalStateConst.SAVING);
    forceQuestionAnswersSave();
  };

  const updateStatus = async () => {
    let targetAnswer = {
      id: answerTry.id,
      answerStatus: STATUS_PERFORMED,
      type: 'ANSWER',
    };

    let isSuccess = false;
    await answerTry
      .link()
      .put(targetAnswer)
      .then(res => {
        isSuccess = true;
      })
      .catch(error => console.log('Не удалось обновить статус задания.', error));
    return isSuccess;
  };

  const forceQuestionAnswersSave = async () => {
    setCompletionModalState(modalStateConst.SAVING);

    let isHasErrors = false;
    for (const question of questions) {
      const result = await manageAnswer(question);
      if (!result) {
        isHasErrors = true;
        setCompletionModalState(modalStateConst.SAVE_ERROR);
      }
    }

    if (!isHasErrors) {
      const result = await updateStatus();
      setCompletionModalState(result ? modalStateConst.SAVED : modalStateConst.SAVE_ERROR);
    }
  };

  // question
  const changeQuestion = offset => {
    const targetIndex = questionIndex + offset;
    if (targetIndex >= 0 && targetIndex < questions.length + (nextPage.current ? 1 : 0)) {
      if (questionIndex >= 0) manageAnswer(questions[questionIndex]);
      setQuestionIndex(targetIndex);
      questionInAnimation(questionIndex > targetIndex);
      scrollRef.current.scrollTo({ y: 0 });

      if (!isFetching && nextPage.current && targetIndex > questions.length - AUTO_FETCHING_THRESHOLD) {
        fetchNextPage();
      }
    }
  };

  const updateQuestion = question => {
    let prevQuestions = questions;
    let targetIndex = questions.findIndex(x => x.id === question.id);
    prevQuestions[targetIndex] = question;
    setQuestions([...prevQuestions]);
  };

  const selectQuestion = index => {
    if (index >= questions.length) {
      fetchNextPage();
    } else {
      setIsContentsPopupShow(false);
      changeQuestion(index - questionIndex);
    }
  };

  // progress
  const addProgress = (count = 1) => {
    setCurrentProgress(currentProgress + count);
  };

  const removeProgress = (count = 1) => {
    setCurrentProgress(currentProgress - count);
  };

  // back press
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, []);

  const [jsCringe, setJsCringe] = useState(false);
  useEffect(() => {
    if (jsCringe) {
      changeQuestion(-1);
      setJsCringe(false);
    }
  }, [jsCringe]);
  const onBackPress = () => {
    setJsCringe(true);
    return true;
  };

  const confirmPerform = () => {
    setIsConfrimPerformShow(true);
  };

  // animation
  const questionInAnimation = (fromRight = true) => {
    questionAnim.setValue(fromRight ? 1 : -1);
    Animated.timing(questionAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const transform = {
    transform: [
      {
        translateX: questionAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -50],
        }),
      },
    ],
    opacity: questionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  };

  const headerContent = <IconButton name="checkmark-outline" onPress={confirmPerform} />;
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header
        title={translate('course.title')}
        headerRight={headerContent}
        onBack={() => manageAnswer(questions[questionIndex])}
      />
      <View style={{ marginHorizontal: 20 }}>
        <View style={[styles.row]}>
          <View style={{ flexDirection: 'row' }}>
            <Text fontSize={14} color={Color.gray}>
              {translate('homeworks.try.questionCount', { number: questionIndex ? questionIndex + 1 : 1 })}
            </Text>
            {isFetching && <ActivityIndicator color={Color.primary} size={14} style={{ marginLeft: 10 }} />}
          </View>
          <View style={[styles.row, { marginTop: 0 }]}>
            <Text fontSize={14} color={Color.gray}>
              {translate('homeworks.try.timeLeft')}:{' '}
            </Text>
            <Text fontSize={14} weight="bold">
              {secondsLeft}
            </Text>
          </View>
        </View>
        <ProgressBar max={total} value={questions.length ? currentProgress : 0} />
      </View>
      <Animated.View style={[{ flexGrow: 1 }, transform]}>
        <ScrollView
          fadingEdgeLength={100}
          style={{ flex: 1, flexGrow: 1, paddingHorizontal: 20, marginTop: 10 }}
          ref={scrollRef}
        >
          {(questionIndex === undefined || (nextPage.current && questionIndex === questions.length)) && (
            <>
              {isHasErrors ? (
                <>
                  <Text style={{ textAlign: 'center', marginTop: 20, marginVertical: 10 }}>
                    {translate('common.error')}
                  </Text>
                  <Button title={translate('common.refresh')} onPress={refresh} />
                </>
              ) : (
                <ActivityIndicator color={Color.primary} size={50} style={{ flexGrow: 1 }} />
              )}
            </>
          )}
          {questionIndex !== undefined && (
            <>
              {questions?.map((question, index) => {
                return (
                  <QuestionAnswer
                    key={question.id}
                    show={index === questionIndex}
                    question={question}
                    setQuestion={updateQuestion}
                    progress={{ add: addProgress, remove: removeProgress }}
                  />
                );
              })}
            </>
          )}
        </ScrollView>
      </Animated.View>

      {!isKeyboardShow && (
        <View style={[styles.row, { marginHorizontal: 10 }]}>
          <Button
            iconName="chevron-back-outline"
            color={Color.silver}
            style={styles.button}
            onPress={() => changeQuestion(-1)}
            disabled={questionIndex === 0}
          />
          <Button
            iconName="menu-outline"
            color={Color.silver}
            style={styles.button}
            onPress={() => setIsContentsPopupShow(true)}
          />
          {!nextPage.current && questionIndex === total - 1 ? (
            <Button iconName="checkmark-outline" style={styles.button} onPress={confirmPerform} />
          ) : (
            <Button iconName="chevron-forward-outline" style={styles.button} onPress={() => changeQuestion(1)} />
          )}
        </View>
      )}
      <ButtonedConfirmationAlert
        show={isConfrimPerformShow}
        text={translate('homeworks.try.confirmationPerform')}
        onReject={() => setIsConfrimPerformShow(false)}
        onConfirm={completeAnswer}
      />
      <QuestionContentsPopup
        show={isContentsPopupShow}
        isFetching={isFetching}
        questions={questions}
        current={questionIndex}
        total={total}
        onPressQuestion={selectQuestion}
        onClose={() => setIsContentsPopupShow(false)}
      />
      <Modal animationType="fade" transparent={true} visible={isCompeted}>
        <View style={styles.backdrop}>
          <View style={styles.centeredView}>
            <View style={styles.modal}>
              <IconButton
                name="close-outline"
                style={styles.close}
                onPress={() => {
                  setIsCompeted(false);
                  navigation.goBack();
                }}
              />
              <Text weight="bold" style={styles.header}>
                {translate('homeworks.try.completion')}
              </Text>
              {isOutsideAnswerStatus && (
                <Text style={{ textAlign: 'center' }}>{translate('homeworks.try.statusOutside')}</Text>
              )}
              {completionModalState === modalStateConst.SAVING && (
                <View style={styles.centerRow}>
                  <ActivityIndicator color={Color.primary} size={30} />
                  <Text style={{ marginLeft: 20 }}>{translate('homeworks.try.questionSaving')}</Text>
                </View>
              )}
              {completionModalState === modalStateConst.SAVE_ERROR && (
                <>
                  <View style={styles.centerRow}>
                    <IconButton name="close-outline" color={Color.danger} />
                    <Text style={{ marginLeft: 10 }}>{translate('homeworks.try.saveError')}</Text>
                  </View>
                  <Button
                    title={translate('homeworks.try.retrySave')}
                    style={{ margin: 20 }}
                    onPress={forceQuestionAnswersSave}
                  />
                </>
              )}
              {completionModalState === modalStateConst.SAVED && (
                <>
                  <View style={styles.centerRow}>
                    <IconButton name="checkmark-outline" color={Color.primary} />
                    <Text style={{ marginLeft: 10 }}>{translate('homeworks.try.saved')}</Text>
                  </View>
                  <Button
                    title={translate('homeworks.try.goBack')}
                    style={{ margin: 20 }}
                    onPress={() => {
                      setIsCompeted(false);
                      navigation.goBack();
                    }}
                  />
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const modalStateConst = {
  NONE: 0,
  CONFIRM: 1,
  SAVING: 2,
  SAVED: 3,
  SAVE_ERROR: 4,
};

export function formatTime(time) {
  var dur = moment.duration(time);
  var hours = Math.floor(dur.asHours());
  var mins = Math.floor(dur.asMinutes()) - hours * 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  button: {
    marginHorizontal: 10,
    marginVertical: 10,
    flexGrow: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#000000AA',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: Color.white,
    borderRadius: 20,
    minWidth: 350,
    maxWidth: '90%',
    minHeight: 120,
  },
  header: {
    textAlign: 'center',
    marginVertical: 10,
  },
  close: {
    position: 'absolute',
    right: 0,
    top: -2,
    padding: 10,
    zIndex: 10,
  },
});

export default TaskTry;
