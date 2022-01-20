import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableNativeFeedback, View } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { SwipeListView } from 'react-native-swipe-list-view';
import BottomPopup from '../../components/common/BottomPopup';
import Button from '../../components/common/Button';
import ConfirmationAlert from '../../components/common/ConfirmationAlert';
import Container from '../../components/common/Container';
import Text from '../../components/common/Text';
import QuestionAnswer from '../../components/interviews/QuestionAnswer';
import Header from '../../components/navigation/Header';
import Avatar from '../../components/user/Avatar';
import Color from '../../constants';
import { HomeworkContext } from '../../navigation/main/HomeworksNavigationConstants';
import { useTranslation } from '../../utils/Internationalization';

export const TASK_EVALUATION_SCREEN = 'taskEvaluation';

export default function TaskEvaluation({ navigation }) {
  const { translate } = useTranslation();

  const { answerTry, setAnswerTry, tasks, interviews } = useContext(HomeworkContext);
  const page = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newScoreFetching, setNewScoreFetching] = useState(false);
  const [currentScore, setCurrentScore] = useState(answerTry.score ?? 0);
  const [showPopup, setShowPopup] = useState(false);
  const commentHref = useMemo(() => {
    return interviews.find(i => i.id === answerTry.interviewId)?.link('interviewMessages')?.href;
  }, [interviews]);

  const maxQuestionsScore = useMemo(() => {
    if (page.current?.link('next')) return null;
    return questions.reduce((accumulator, value) => accumulator + value.questionVariant.questionMaxScore, 0);
  }, [questions]);

  const task = useMemo(() => {
    return tasks.find(t => t.id == answerTry.taskId);
  }, [answerTry, tasks]);

  useEffect(() => {
    if (answerTry && questions.length == 0) {
      setCurrentScore(Number((answerTry.score ?? answerTry.notConfirmedScore)?.toFixed(2)));
      fetch(answerTry.link('questions'));
    }
  }, [answerTry]);

  function fetch(link) {
    link?.fetch(setLoading).then(newPage => {
      page.current = newPage;
      setQuestions([...questions, ...(newPage.list('questions') ?? [])]);
    });
  }

  function fetchNext() {
    if (!loading) fetch(page.current?.link('next'));
  }

  function handleScoreChange(oldValue, newValue) {
    if (maxQuestionsScore) {
      const weight = task.maxScore / maxQuestionsScore;
      setCurrentScore(Number((currentScore + (newValue - oldValue) * weight).toFixed(2)));
    } else {
      answerTry
        .link()
        .fetch(setNewScoreFetching)
        .then(answer => {
          setCurrentScore(Number(answer.notConfirmedScore.toFixed(2)));
        });
    }
  }

  function onEvaluate(status) {
    answerTry
      .link()
      .put({ answerStatus: status, type: 'ANSWER' }, setSaving)
      .then(() => {
        setShowPopup(false);
        setAnswerTry({ ...answerTry, answerStatus: status, score: currentScore });
        navigation.pop();
      });
  }

  return (
    <>
      <Header title={task?.name} headerRight={answerTry && <Avatar email={answerTry.author.email} />} />

      <SwipeListView
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        data={questions}
        fadingEdgeLength={30}
        onEndReached={fetchNext}
        onEndReachedThreshold={1}
        contentContainerStyle={styles.container}
        style={{ flexGrow: 1 }}
        keyExtractor={item => item.id}
        ListFooterComponent={loading && <ActivityIndicator color={Color.primary} size={50} />}
        ListFooterComponentStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
        renderItem={({ item: question }) => (
          <QuestionAnswer question={question} onScoreChange={handleScoreChange} commentCreateHref={commentHref} />
        )}
      />
      <View style={styles.container}>
        <View style={styles.bottomPanel}>
          <View
            style={{
              flexGrow: 1,
              marginRight: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text weight="bold">Текущий балл: </Text>
            {(newScoreFetching || saving) && <ActivityIndicator color={Color.primary} size={25} />}
            {!newScoreFetching && !saving && (
              <Text Text weight="bold">
                {currentScore}
              </Text>
            )}
          </View>
          <Button title={'Оценить'} onPress={() => setShowPopup(true)} />
        </View>
      </View>
      <BottomPopup show={showPopup} title={translate('common.actions')} onClose={() => setShowPopup(false)}>
        {saving && (
          <View style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={Color.primary} size={50} />
          </View>
        )}
        {!saving && (
          <>
            <TouchableNativeFeedback onPress={() => onEvaluate('APPRECIATED')}>
              <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
                <Text style={{ textAlign: 'center', padding: 15, color: Color.success }}>{'Принять'}</Text>
              </View>
            </TouchableNativeFeedback>
            {(!task.duration || task.duration - 5 > answerTry.totalDuration / 1000 / 60) && (
              <TouchableNativeFeedback onPress={() => onEvaluate('RETURNED')}>
                <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
                  <Text style={{ textAlign: 'center', padding: 15 }}>{'Вернуть'}</Text>
                </View>
              </TouchableNativeFeedback>
            )}
            <ConfirmationAlert
              title={translate('common.confirmation')}
              text={
                'Уверены, что хотите отклонить работу ученика? Он не получит за неё баллы и не сможет переделать её.'
              }
              onConfirm={() => onEvaluate('NOT_APPRECIATED')}
            >
              {({ confirm }) => (
                <TouchableNativeFeedback onPress={confirm}>
                  <View style={{ borderTopWidth: StyleSheet.hairlineWidth }}>
                    <Text style={{ textAlign: 'center', padding: 15, color: Color.danger }}>{'Отклонить'}</Text>
                  </View>
                </TouchableNativeFeedback>
              )}
            </ConfirmationAlert>
          </>
        )}
      </BottomPopup>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  bottomPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
});
