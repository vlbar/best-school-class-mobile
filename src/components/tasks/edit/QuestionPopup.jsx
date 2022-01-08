import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable, UIManager, LayoutAnimation, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import BottomPopup from './../../common/BottomPopup';
import Color from '../../../constants';
import QuestionVariant from './QuestionVariant';
import Text from '../../common/Text';
import useBestValidation, { BestValidation } from '../../../utils/useBestValidation';
import { TEXT_QUESTION } from './types/TextQuestion';
import { useTranslation } from './../../../utils/Internationalization';

const MAX_QUESTION_VARIANTS_COUNT = 10;

function QuestionPopup({ show, taskQuestion, onClose }) {
  const { translate } = useTranslation();
  const [question, setQuestion] = useState(taskQuestion);
  const [selectedVariant, setSelectedVariant] = useState(undefined);

  const questionValidationSchema = {
    maxScore: {
      type: 'number',
      min: [1, translate('tasks.question.validation.maxScoreMin', { min: 1 })],
      max: [9223372036854775807, translate('tasks.question.validation.maxScoreMax')],
    },
  };

  const questionValidation = useBestValidation(questionValidationSchema, isValid =>
    setQuestion({ ...question, isValid }),
  );

  const varinatScrollRef = useRef();
  const questionVarinatRef = useRef();

  const setScore = score => setQuestion({ ...question, maxScore: score });

  const onCloseHandler = () => {
    let isQuestionValid = validateSelectedVariant();

    if (isQuestionValid && question.questionVariants.length > 1) {
      for (const variant of question.questionVariants) {
        if (variant.isValid === false) {
          isQuestionValid = false;
          break;
        }
      }
    }

    if (!isQuestionValid) {
      showNotValidOnClose();
      return false;
    } else {
      questionValidation.reset();
      onClose?.({ ...question, selectedVariant: selectedVariant.key });
      return true;
    }
  };

  useEffect(() => {
    if (taskQuestion) {
      setQuestion(taskQuestion);

      if (!taskQuestion.questionVariants.length) {
        addNewVariant(taskQuestion);
        return;
      }

      const selectedVarinat =
        taskQuestion?.questionVariants.find(variant => variant.key === taskQuestion.selectedVariant) ??
        taskQuestion?.questionVariants[0];
      setSelectedVariant(selectedVarinat);
    }
  }, [taskQuestion]);

  const setQuestionVariant = variant => {
    if (!question) return;
    let questionVariants = question?.questionVariants ?? [];

    let selectedIndex = questionVariants.findIndex(x => variant.key === x.key);
    questionVariants[selectedIndex] = variant;

    setQuestion({ ...question, questionVariants });
  };

  const addNewVariant = (targetQuestion = question) => {
    const emptyVariant = {
      id: null,
      key: Math.random(),
      formulation: '',
      position: targetQuestion.questionVariants.length + 1,
      type: TEXT_QUESTION,
    };

    const questionVariants = [...targetQuestion.questionVariants, emptyVariant];
    setQuestion({ ...targetQuestion, questionVariants });
    changeSelectedVariant(emptyVariant, questionVariants);

    questionValidation.reset();
    varinatScrollRef.current.scrollToEnd({ animated: true });
  };

  const deleteVariant = variant => {
    const deletedIndex = question.questionVariants.findIndex(x => x.key === variant.key);
    const questionVariants = question.questionVariants.filter(x => x.key !== variant.key);
    setQuestion({ ...question, questionVariants });

    if (selectedVariant.key === variant.key) {
      if (deletedIndex === 0) changeSelectedVariant(question.questionVariants[1], questionVariants);
      else changeSelectedVariant(question.questionVariants[deletedIndex - 1], questionVariants);
    }
  };

  // questionVariants param for cringe
  const changeSelectedVariant = (variant, questionVariants) => {
    validateSelectedVariant(questionVariants);
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

  const showNotValidOnClose = () => {
    Alert.alert(translate('common.confirmation'), translate('tasks.question.closeNotValid'), [
      {
        text: translate('common.cancel'),
        style: 'cancel',
      },
      { text: translate('common.ok'), onPress: () => onClose?.({ ...question, selectedVariant: selectedVariant.key }) },
    ]);
  };

  const validateSelectedVariant = targetQuestionVariants => {
    if (!selectedVariant) return undefined;
    let questionVariants = targetQuestionVariants ?? question?.questionVariants;
    let questionVariant = questionVariants.find(x => x.key === selectedVariant.key);

    if (!questionVariant) return undefined;
    const isValid = questionVarinatRef.current.validate();
    questionVariant.isValid = isValid;
    setQuestion({ ...question, questionVariants });
    return isValid;
  };

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const r = /\d+/;
  return (
    <BottomPopup title={translate('tasks.question.title')} show={show} onClose={onCloseHandler}>
      <ScrollView horizontal fadingEdgeLength={50} style={[styles.variantsRow]} ref={varinatScrollRef}>
        {question?.questionVariants?.map(variant => {
          return (
            <Pressable
              key={variant.key}
              style={[styles.variantCheck]}
              onPress={() => {
                changeSelectedVariant(variant);
              }}
              onLongPress={() => showDeleteVariantAlert(variant)}
            >
              <View
                style={[
                  styles.variant,
                  selectedVariant?.key === variant?.key && styles.active,
                  variant?.isValid === false && styles.notValid,
                ]}
              />
            </Pressable>
          );
        })}
        {question?.questionVariants?.length < MAX_QUESTION_VARIANTS_COUNT && (
          <Pressable style={[styles.variantCheck]}>
            <Icon name="add-outline" size={18} onPress={() => addNewVariant()} />
          </Pressable>
        )}
      </ScrollView>
      {question?.questionVariants?.map(variant => {
        const isSelected = variant.key === selectedVariant.key;
        return (
          <QuestionVariant
            key={variant.key}
            show={isSelected}
            questionVariant={variant}
            setQuestionVariant={setQuestionVariant}
            ref={ref => {
              if (isSelected) questionVarinatRef.current = ref;
            }}
            showDeleteVariantAlert={() => showDeleteVariantAlert(variant)}
          />
        );
      })}
      <BestValidation.Context validation={questionValidation} entity={question}>
        <View style={styles.row}>
          <Text style={styles.ballsText} fontSize={14}>
            {translate('tasks.question.maxScore')}
          </Text>
          
          <BestValidation.InputForm
            name="maxScore"
            hideErrorMessage
            keyboardType="numeric"
            onChange={value => setScore(value)}
            onEndEditing={value => setScore(Number(value.match(r)) || 0)}
            style={styles.ballsInput}
          />
        </View>
        <Text style={styles.rowErrorMessage}>{questionValidation.errors.maxScore}</Text>
      </BestValidation.Context>
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
    opacity: 0.5,
  },
  ballsText: {
    color: Color.silver,
    marginBottom: 10,
  },
  ballsInput: {
    maxWidth: 120,
    marginBottom: 0,
  },
  active: {
    backgroundColor: Color.primary,
    opacity: 1,
  },
  notValid: {
    backgroundColor: Color.danger,
  },
  rowErrorMessage: {
    color: Color.danger,
    fontSize: 14,
    marginHorizontal: 20,
    marginBottom: 10,
  },
});

export default QuestionPopup;
