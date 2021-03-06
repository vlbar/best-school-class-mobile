import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable, RefreshControl, TouchableNativeFeedback, Alert } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import Icon from 'react-native-vector-icons/Ionicons';

import BottomPopup from '../../common/BottomPopup';
import Button from '../../common/Button';
import Color from '../../../constants';
import IconButton from '../../common/IconButton';
import QuestionPopup from './QuestionPopup';
import Resource from '../../../utils/Hateoas/Resource';
import Text from '../../common/Text';
import useQuestionSaveManager from './useQuestionSaveManager';
import { clearHtmlTags } from '../TaskList';
import { getQuestionTypeLabelKey } from './QuestionVariant';
import { useTranslation } from './../../../utils/Internationalization';

const baseUrl = '/v1/tasks';
const questionsPartUrl = 'questions';
const getQuestionsLink = id => Resource.basedOnHref(`${baseUrl}/${id}/${questionsPartUrl}`).link().fill('size', 10);

function QuestionList({ taskId, setIsSaving }) {
  const [questions, setQuestions] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const nextPage = useRef(undefined);

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [actionedQuestion, setActionedQuestion] = useState(null);
  const [isMoveMode, setIsMoveMode] = useState(false);

  const { isSaving, addToManage, manageQuestion } = useQuestionSaveManager(getQuestionsLink(taskId), updateQuestion);

  const { translate } = useTranslation();

  // fetching list
  useEffect(() => {
    refreshPage();
  }, []);

  const fetchQuestions = link => {
    link
      ?.fetch(setIsFetching)
      .then(page => {
        let fetchedQuestions = page.list('questions') ?? [];
        fetchedQuestions.forEach(x => {
          x.key = x.id;
          x.questionVariants = x.questionVariants.map(v => ({ ...v, key: v.id }));
        });
        nextPage.current = page.link('next');

        addToManage(fetchedQuestions);
        if (page.page.number == 1) setQuestions(fetchedQuestions);
        else setQuestions([...questions, ...fetchedQuestions]);
      })
      .catch(error => console.log('???? ?????????????? ?????????????????? ???????????? ????????????????.', error));
  };

  const refreshPage = () => {
    fetchQuestions(getQuestionsLink(taskId));
  };

  const fetchNextPage = () => {
    fetchQuestions(nextPage.current);
  };

  useEffect(() => {
    setIsSaving?.(isSaving)
  }, [isSaving])

  // question control
  const onCloseQuestion = question => {
    if (question.isValid === undefined || question.isValid === true) manageQuestion(question);
    updateQuestion(question);
    setSelectedQuestion(null);
  };

  function updateQuestion(question) {
    let prevQuestions = questions;
    let targetIndex = questions.findIndex(x => x.key === question.key);
    prevQuestions[targetIndex] = question;
    setQuestions([...prevQuestions]);
  }

  const addQuestionAfter = position => {
    setActionedQuestion(null);

    let targetQuestions = questions;
    targetQuestions.filter(x => x.position >= position).forEach(x => x.position++);

    const newQuestion = {
      id: null,
      key: Math.random(),
      detached: true,
      position: position,
      maxScore: 1,
      questionVariants: [],
    };

    const targetIndex = targetQuestions.findIndex(x => x.position >= position);
    if (targetIndex < 0) targetQuestions.push(newQuestion);
    else targetQuestions.splice(targetIndex, 0, newQuestion);

    setSelectedQuestion(newQuestion);
    setQuestions([...targetQuestions]);
  };

  const deleteQuestion = question => {
    if (!question.detached === true) manageQuestion({ ...question, isDeleted: true });
    setActionedQuestion(null);
    setQuestions(questions.filter(x => x.key !== question.key));
  };

  const startMoveMode = () => {
    setActionedQuestion(null);
    setIsMoveMode(true);
  };

  const moveQuestion = ({ from, to }) => {
    const toPosition = questions[to].position;
    let movedQuestion = questions[from];

    let movedQuestions = questions;
    if (to > from) for (let i = from + 1; i <= to; i++) movedQuestions[i].position--;
    else for (let i = to; i < from; i++) movedQuestions[i].position++;

    movedQuestions = arrayMove(movedQuestions, from, to);
    movedQuestion.position = toPosition;
    setQuestions([...movedQuestions]);
    manageQuestion(movedQuestion);
  };

  // render
  const addQuestionButton = () => {
    if (nextPage.current != undefined || isFetching) return <></>;
    return (
      <Button
        title={translate('tasks.question.add')}
        style={styles.add}
        onPress={() => addQuestionAfter(questions[questions.length - 1]?.position + 1 || 0)}
      />
    );
  };

  const renderQuestionItem = ({ item, drag, isActive }) => {
    const selectedVariant = item.questionVariants.find(x => x.key === item.selectedVariant) ?? item.questionVariants[0];
    const isUkraine =
      item.questionVariants.length === 3 &&
      item.questionVariants[2]?.isValid === false &&
      item.questionVariants[0]?.isValid &&
      item.questionVariants.findIndex(x => x.key === selectedVariant.key) === 1;
    let isQuestionNotValid = item?.isValid === false ?? false;
    if (!isQuestionNotValid) {
      for (const variant of item.questionVariants)
        if (variant.isValid === false) {
          isQuestionNotValid = true;
          break;
        }
    }

    return (
      <ScaleDecorator>
        <Pressable
          style={[styles.question, isQuestionNotValid && styles.noValidQuestion, isUkraine && styles.ukraine]}
          onPress={() => !isMoveMode && setSelectedQuestion(item)}
          onLongPress={() => (isMoveMode ? drag() : setActionedQuestion(item))}
        >
          <View style={[styles.header]}>
            <Icon name="reorder-two-outline" size={21} />
            <View style={[styles.variantsRow]}>
              {item.questionVariants.length > 1 &&
                item.questionVariants?.map((variant, index) => {
                  return (
                    <View
                      key={variant.key}
                      style={[
                        styles.variant,
                        variant.key === selectedVariant.key && styles.active,
                        variant?.isValid === false && styles.notValid,
                      ]}
                    />
                  );
                })}
            </View>
          </View>
          <Text numberOfLines={10} ellipsizeMode="tail" style={styles.formulation}>
            {selectedVariant?.formulation.length
              ? clearHtmlTags(selectedVariant.formulation)
              : translate('tasks.question.variant.empty-formulation')}
          </Text>
          <View style={[styles.footer]}>
            <Text color={Color.silver} fontSize={14}>
              {translate('tasks.question.variant.type')}
            </Text>
            <Text color={Color.silver} fontSize={14}>
              {translate(getQuestionTypeLabelKey(selectedVariant))}
            </Text>
          </View>
        </Pressable>
      </ScaleDecorator>
    );
  };

  const showDeleteAlert = () => {
    Alert.alert(translate('common.confirmation'), translate('tasks.question.deleteConfirmation'), [
      {
        text: translate('common.cancel'),
        style: 'cancel',
      },
      { text: translate('common.ok'), onPress: () => deleteQuestion(actionedQuestion) },
    ]);
  };

  const moveModeHeader = () => {
    return (
      <View style={styles.moveModeHeader}>
        <View style={styles.moveModeHeaderInner}>
          <Text>{translate('tasks.question.moveMode')}</Text>
          <IconButton name="close" onPress={() => setIsMoveMode(false)} />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {isMoveMode && moveModeHeader()}
      <DraggableFlatList
        data={questions}
        renderItem={renderQuestionItem}
        ListFooterComponent={addQuestionButton}
        keyExtractor={item => item.key}
        onDragEnd={moveQuestion}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.7}
        refreshControl={<RefreshControl tintColor={'#FCF450'} onRefresh={refreshPage} refreshing={isFetching} />}
      />
      <QuestionPopup show={selectedQuestion !== null} taskQuestion={selectedQuestion} onClose={onCloseQuestion} />
      <BottomPopup
        show={actionedQuestion !== null}
        title={translate('common.actions')}
        onClose={() => setActionedQuestion(null)}
      >
        <LigthButton
          title={translate('tasks.question.addAfter')}
          onPress={() => addQuestionAfter(actionedQuestion.position + 1)}
        />
        <LigthButton title={translate('tasks.question.moveMode')} onPress={startMoveMode} />
        <LigthButton title={translate('tasks.question.delete')} color={Color.danger} onPress={showDeleteAlert} />
      </BottomPopup>
    </View>
  );
}

function LigthButton({ title, onPress, color }) {
  return (
    <TouchableNativeFeedback onPress={onPress}>
      <View>
        <Text style={{ textAlign: 'center', padding: 15 }} color={color}>
          {title}
        </Text>
      </View>
    </TouchableNativeFeedback>
  );
}

function arrayMove(arr, oldIndex, newIndex) {
  if (newIndex >= arr.length) {
    var k = newIndex - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
  return arr;
}

const styles = StyleSheet.create({
  question: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 10,
    backgroundColor: Color.ultraLightPrimary,
    borderRadius: 10,
  },
  noValidQuestion: {
    borderWidth: 2,
    borderColor: Color.danger,
  },
  ukraine: {
    borderTopColor: 'blue',
    borderStartColor: 'blue',
    borderBottomColor: 'yellow',
    borderEndColor: 'yellow',
  },
  header: {
    flexDirection: 'row',
  },
  variantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  variant: {
    width: 10,
    height: 10,
    backgroundColor: Color.lightGray,
    borderRadius: 10,
    marginRight: 4,
    opacity: 0.5,
  },
  active: {
    backgroundColor: Color.primary,
    opacity: 1,
  },
  notValid: {
    backgroundColor: Color.danger,
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  add: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  moveModeHeader: {
    position: 'absolute',
    top: -56,
    width: '100%',
    height: 56,
    backgroundColor: Color.white,
    paddingHorizontal: 20,
  },
  moveModeHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
});

export default QuestionList;
