import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable, UIManager, LayoutAnimation, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import BottomPopup from './../../common/BottomPopup';
import Color from '../../../constants';
import InputForm from '../../common/InputForm';
import QuestionVariant from './QuestionVariant';
import Text from '../../common/Text';
import { TEXT_QUESTION } from './types/TextQuestion';
import { useTranslation } from './../../../utils/Internationalization';

const MAX_QUESTION_VARIANTS_COUNT = 10;

function QuestionPopup({ show, taskQuestion, onClose }) {
  const { translate } = useTranslation();
  const [question, setQuestion] = useState(taskQuestion);
  const [selectedVariant, setSelectedVariant] = useState(undefined);

  const varinatScrollRef = useRef();

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

  const addNewVariant = variant => {
    const emptyVariant = {
      id: Math.random(),
      detached: true,
      formulation: '',
      type: TEXT_QUESTION,
    };

    setQuestion({ ...question, questionVariants: [...question.questionVariants, emptyVariant] });

    changeSelectedVariant(emptyVariant);
    varinatScrollRef.current.scrollToEnd({ animated: true });
  };

  const deleteVariant = variant => {
    const deletedIndex = question.questionVariants.findIndex(x => x.id === variant.id);
    setQuestion({ ...question, questionVariants: question.questionVariants.filter(x => x.id !== variant.id) });

    if (selectedVariant.id === variant.id) {
      if (deletedIndex === 0) changeSelectedVariant(question.questionVariants[1]);
      else changeSelectedVariant(question.questionVariants[deletedIndex - 1]);
    }
  };

  const changeSelectedVariant = variant => {
    LayoutAnimation.configureNext(LayoutAnimation.create(200, 'linear', 'opacity'));
    setSelectedVariant(variant);
  };

  const showDeleteVariantAlert = variant => {
    if (question?.questionVariants.length > 1) {
      Alert.alert(translate('common.confirmation'), translate('tasks.question.variant.delete-confirmation'), [
        {
          text: translate('common.cancel'),
          style: 'cancel',
        },
        { text: translate('common.ok'), onPress: () => deleteVariant(variant) },
      ]);
    } else {
      Alert.alert(translate('common.confirmation'), translate('tasks.question.variant.delete-last'), [
        { text: translate('common.ok') },
      ]);
    }
  };

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  return (
    <BottomPopup title={translate('tasks.question.title')} show={show} onClose={onCloseHandler}>
      <ScrollView horizontal fadingEdgeLength={50} style={[styles.variantsRow]} ref={varinatScrollRef}>
        {question?.questionVariants?.map(variant => {
          return (
            <Pressable
              key={variant.id}
              style={[styles.variantCheck]}
              onPress={() => {
                changeSelectedVariant(variant);
              }}
              onLongPress={() => showDeleteVariantAlert(variant)}
            >
              <View style={[styles.variant, selectedVariant?.id === variant?.id && styles.active]} />
            </Pressable>
          );
        })}
        {question?.questionVariants.length < MAX_QUESTION_VARIANTS_COUNT && (
          <Pressable style={[styles.variantCheck]}>
            <Icon name="add-outline" size={18} onPress={addNewVariant} />
          </Pressable>
        )}
      </ScrollView>
      {selectedVariant && <QuestionVariant questionVariant={selectedVariant} setQuestionVariant={setQuestionVariant} />}
      <View style={styles.row}>
        <Text style={styles.ballsText} fontSize={14}>
          {translate('tasks.question.balls')}
        </Text>
        <InputForm
          value={String(question?.maxScore)}
          onChange={setScore}
          keyboardType="numeric"
          style={styles.ballsInput}
        />
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
    marginHorizontal: 20,
  },
  variantCheck: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
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
