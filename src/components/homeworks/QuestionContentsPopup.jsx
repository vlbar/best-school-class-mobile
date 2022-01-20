import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import BottomPopup from './../common/BottomPopup';
import Color from '../../constants';
import IconButton from '../common/IconButton';
import Text from '../common/Text';
import { questionTypeInputs } from './questionTypes/QuestionAnswer';
import { useTranslation } from '../../utils/Internationalization';

const questionAnswerState = {
  UNLOADED: 'Unloaded',
  LOADED: 'Loaded',
  SELECTED: 'Selected',
  ANSWERED: 'Answered',
};

function QuestionContentsPopup({ show, isFetching, questions, current, total, onPressQuestion, onClose }) {
  const { translate } = useTranslation();
  const [fullQuestionsArray, setFullQuestionsArray] = useState([]);
  const [isAnsweredList, setIsAnsweredList] = useState([]);
  const [isHelpShow, setIsHelpShow] = useState(false);
  const prevQuestionsCount = useRef(0);
  const prevIndex = useRef(0);

  useEffect(() => {
    setFullQuestionsArray(new Array(total).fill(0));
  }, [total]);

  useEffect(() => {
    for (let i = prevQuestionsCount.current; i < questions.length; i++) {
      checkQuestionAnswered(i);
    }

    prevQuestionsCount.current = questions.length;
  }, [questions.length]);

  useEffect(() => {
    checkQuestionAnswered(prevIndex.current);
    prevIndex.current = current;
  }, [show, current]);

  const checkQuestionAnswered = index => {
    const question = questions[index];
    if (!question) return;
    const inputComponent = questionTypeInputs.find(x => x.type === question.questionVariant.type)?.component;
    if (!inputComponent) return;
    setIsAnsweredList(list => {
      list[index] = question.questionAnswer ? inputComponent.isQuestionAnswered(question.questionAnswer) : false;
      return [...list];
    });
  };

  const getStyle = state => {
    switch (state) {
      case questionAnswerState.UNLOADED:
        return styles.unloaded;
      case questionAnswerState.LOADED:
        return styles.loaded;
      case questionAnswerState.SELECTED:
        return styles.selected;
      case questionAnswerState.ANSWERED:
        return styles.answered;
    }
  };

  const toggleHelp = () => {
    setIsHelpShow(!isHelpShow);
  };

  return (
    <BottomPopup title={translate('homeworks.try.questions')} show={show} onClose={onClose}>
      <View style={styles.row}>
        {fullQuestionsArray.map((question, index) => {
          let state = questionAnswerState.UNLOADED;
          if (index === current) {
            state = questionAnswerState.SELECTED;
          } else {
            if (isAnsweredList[index]) state = questionAnswerState.ANSWERED;
            else if (questions[index]) state = questionAnswerState.LOADED;
          }

          return (
            <TouchableOpacity key={index} onPress={() => onPressQuestion(index)} activeOpacity={0.7}>
              <View style={[styles.question, getStyle(state)]}>
                {state === questionAnswerState.UNLOADED && isFetching && (
                  <ActivityIndicator size={18} color={Color.primary} style={{ flexGrow: 1 }} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      {isHelpShow && (
        <View style={styles.colomnRow}>
          <View style={styles.infoRow}>
            <View style={[styles.question, getStyle(questionAnswerState.SELECTED)]} />
            <Text>{translate('homeworks.try.selected')}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.question, getStyle(questionAnswerState.ANSWERED)]} />
            <Text>{translate('homeworks.try.answered')}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.question, getStyle(questionAnswerState.UNLOADED)]} />
            <Text style={{ flexGrow: 1 }}>{translate('homeworks.try.unloaded')}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.question, getStyle(questionAnswerState.LOADED)]} />
            <Text>{translate('homeworks.try.loaded')}</Text>
          </View>
        </View>
      )}
      <IconButton name="help-circle-outline" onPress={toggleHelp} style={styles.help} />
    </BottomPopup>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginTop: 10,
  },
  colomnRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingRight: 20,
    width: '50%',
  },
  question: {
    width: 28,
    height: 28,
    backgroundColor: Color.lightGray,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
    opacity: 0.6,
  },
  unloaded: {},
  loaded: { backgroundColor: Color.gray },
  selected: { backgroundColor: Color.primary, opacity: 1 },
  answered: { backgroundColor: Color.success },
});

export default QuestionContentsPopup;
