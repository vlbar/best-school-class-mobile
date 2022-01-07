import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import Icon from 'react-native-vector-icons/Ionicons';

import Color from '../../../constants';
import QuestionPopup from './QuestionPopup';
import Resource from '../../../utils/Hateoas/Resource';
import Text from '../../common/Text';
import { clearHtmlTags } from '../TaskList';
import { getQuestionTypeLabelKey } from './QuestionVariant';
import { useTranslation } from './../../../utils/Internationalization';

const baseUrl = '/v1/tasks';
const questionsPartUrl = 'questions';
const getQuestionsLink = id => Resource.basedOnHref(`${baseUrl}/${id}/${questionsPartUrl}`).link().fill('size', 20);

function QuestionList({ taskId }) {
  const [questions, setQuestions] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const nextPage = useRef(undefined);

  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const { translate } = useTranslation();

  useEffect(() => {
    fetchQuestions(getQuestionsLink(taskId));
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

  const onCloseQuestion = question => {
    let prevQuestions = questions;
    let targetIndex = questions.findIndex(x => x.id === question.id);
    prevQuestions[targetIndex] = question;
    setQuestions(prevQuestions);
    setSelectedQuestion(null);
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
          onLongPress={drag}
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
            {selectedVariant.formulation.length
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

  return (
    <View style={{ flex: 1 }}>
      <DraggableFlatList data={questions} renderItem={renderQuestionItem} keyExtractor={item => item.id} />
      <QuestionPopup show={selectedQuestion !== null} taskQuestion={selectedQuestion} onClose={onCloseQuestion} />
    </View>
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
});

export default QuestionList;
