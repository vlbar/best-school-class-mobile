import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable, RefreshControl, TouchableNativeFeedback, Alert } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import Icon from 'react-native-vector-icons/Ionicons';

import BottomPopup from '../../common/BottomPopup';
import Button from '../../common/Button';
import Color from '../../../constants';
import QuestionPopup from './QuestionPopup';
import Resource from '../../../utils/Hateoas/Resource';
import Text from '../../common/Text';
import { clearHtmlTags } from '../TaskList';
import { getQuestionTypeLabelKey } from './QuestionVariant';
import { useTranslation } from './../../../utils/Internationalization';

const baseUrl = '/v1/tasks';
const questionsPartUrl = 'questions';
const getQuestionsLink = id => Resource.basedOnHref(`${baseUrl}/${id}/${questionsPartUrl}`).link().fill('size', 10);

function QuestionList({ taskId }) {
  const [questions, setQuestions] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const nextPage = useRef(undefined);

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [actionedQuestion, setActionedQuestion] = useState(null);

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
        nextPage.current = page.link('next');

        if (page.page.number == 1) setQuestions(fetchedQuestions);
        else setQuestions([...questions, ...fetchedQuestions]);
      })
      .catch(error => console.log('Не удалось загрузить список вопросов.', error));
  };

  const refreshPage = () => {
    fetchQuestions(getQuestionsLink(taskId));
  };

  const fetchNextPage = () => {
    fetchQuestions(nextPage.current);
  };

  // question control
  const onCloseQuestion = question => {
    let prevQuestions = questions;
    let targetIndex = questions.findIndex(x => x.id === question.id);
    prevQuestions[targetIndex] = question;
    setQuestions(prevQuestions);
    setSelectedQuestion(null);
  };

  const addQuestionAfter = position => {
    setActionedQuestion(null);

    let targetQuestions = questions;
    targetQuestions.filter(x => x.position >= position).forEach(x => x.position++);

    const newQuestion = {
      id: Math.random(),
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
    setActionedQuestion(null);
    setQuestions(questions.filter(x => x.id !== question.id));
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
    const selectedVariant = item.questionVariants.find(x => x.id === item.selectedVariant) ?? item.questionVariants[0];
    const isUkraine =
      item.questionVariants.length === 3 &&
      item.questionVariants[2]?.isValid === false &&
      item.questionVariants[0]?.isValid &&
      item.questionVariants.findIndex(x => x.id === selectedVariant.id) === 1;
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
          onPress={() => setSelectedQuestion(item)}
          onLongPress={() => setActionedQuestion(item)}
        >
          <View style={[styles.header]}>
            <Icon name="reorder-two-outline" size={21} />
            <View style={[styles.variantsRow]}>
              {item.questionVariants.length > 1 &&
                item.questionVariants?.map((variant, index) => {
                  return (
                    <View
                      key={variant.id}
                      style={[
                        styles.variant,
                        variant.id === selectedVariant.id && styles.active,
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

  return (
    <View style={{ flex: 1 }}>
      <DraggableFlatList
        data={questions}
        renderItem={renderQuestionItem}
        ListFooterComponent={addQuestionButton}
        keyExtractor={item => item.id}
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
        <LigthButton title={translate('tasks.question.moveMode')} />
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
});

export default QuestionList;
