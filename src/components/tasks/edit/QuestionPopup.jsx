import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, UIManager, LayoutAnimation } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import BottomPopup from './../../common/BottomPopup';
import Color from '../../../constants';
import InputForm from '../../common/InputForm';
import Text from '../../common/Text';
import { useTranslation } from './../../../utils/Internationalization';

import QuestionVariant from './QuestionVariant';

function QuestionPopup({ show, taskQuestion, onClose }) {
  const { translate } = useTranslation();
  const [question, setQuestion] = useState(taskQuestion);
  const [selectedVariant, setSelectedVariant] = useState(undefined);

  const setScore = score => setQuestion({ ...question, maxScore: score });

  const onCloseHandler = () => {
    onClose?.({ ...question, selectedVariant: selectedVariant.id });
  };

  useEffect(() => {
    if (taskQuestion) {
      setQuestion(taskQuestion);
      setSelectedVariant(
        taskQuestion?.questionVariants.find(variant => variant.id === taskQuestion.selectedVariant) ??
          taskQuestion?.questionVariants[0],
      );
    }
  }, [taskQuestion]);

  const setQuestionVariant = variant => {
    if (!question) return;
    let questionVariants = question.questionVariants;

    let selectedIndex = questionVariants.findIndex(variant => variant.id === selectedVariant.id);
    questionVariants[selectedIndex] = variant;

    setSelectedVariant(variant);
    setQuestion({ ...question, questionVariants });
  };

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  return (
    <BottomPopup title={translate('tasks.question.title')} show={show} onClose={onCloseHandler}>
      <View style={[styles.variantsRow]}>
        {question?.questionVariants?.map(variant => {
          return (
            <Pressable
              key={variant.id}
              style={[styles.variantCheck]}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.create(200, 'linear', 'opacity'));
                setSelectedVariant(variant);
              }}
            >
              <View style={[styles.variant, selectedVariant?.id === variant?.id && styles.active]} />
            </Pressable>
          );
        })}
        <Pressable style={[styles.variantCheck]}>
          <Icon name="add-outline" size={18} />
        </Pressable>
      </View>
      {selectedVariant && <QuestionVariant questionVariant={selectedVariant} setQuestionVariant={setQuestionVariant} />}
      <View style={styles.row}>
        <Text style={styles.ballsText} fontSize={14}>
          {translate('tasks.question.balls')}
        </Text>
        <InputForm value={String(question?.maxScore)} onChange={setScore} keyboardType="numeric" style={styles.ballsInput} />
      </View>
    </BottomPopup>
  );
}

const styles = StyleSheet.create({
  row: {
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  variantCheck: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  variant: {
    width: 12,
    height: 12,
    backgroundColor: Color.lightGray,
    borderRadius: 10,
    marginRight: 4,
  },
  ballsText: {
    color: Color.silver,
    marginBottom: 10,
  },
  ballsInput: {
    maxWidth: 120,
  },
  active: {
    backgroundColor: Color.primary,
  },
});

export default QuestionPopup;
