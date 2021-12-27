import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

import Color from '../../../constants';
import InputForm from '../../common/InputForm';
import TestQuestion, { TEST_MULTI_QUESTION, TEST_QUESTION } from './types/TestQuestion';
import Text from '../../common/Text';
import TextQuestion, { TEXT_QUESTION } from './types/TextQuestion';
import { clearHtmlTags } from '../TaskList';
import { useTranslation } from './../../../utils/Internationalization';

const questionTypes = [
  { labelKey: 'tasks.question.variant.textQuestion.title', value: TEXT_QUESTION, component: TextQuestion },
  { labelKey: 'tasks.question.variant.testQuestion.title', value: TEST_QUESTION, component: TestQuestion },
  {
    labelKey: 'tasks.question.variant.testMultiQuestion.title',
    value: TEST_MULTI_QUESTION,
    component: TestQuestion,
  },
];

export const getInnerType = variant => {
  for (const type of questionTypes)
    if (type.component.souceType === variant.type) return type.component.getInnerType(variant);
};

/**
 * @param  {(String|Object)} source - inner question type name or variant
 * @return {String} label key for translate
 */
export const getQuestionTypeLabelKey = source => {
  if (!source) return undefined;
  if (typeof source === 'string' || source instanceof String)
    return questionTypes.find(x => x.value === source).labelKey;
  else return getQuestionTypeLabelKey(getInnerType(source));
};

function QuestionVariant({ questionVariant, setQuestionVariant }) {
  const { translate } = useTranslation();
  const translatedQuestionTypes = questionTypes.map(x => {
    x.label = translate(x.labelKey);
    return x;
  });

  const [variant, setVariant] = useState(questionVariant);
  const [questionType, setQuestionType] = useState(TEXT_QUESTION);
  const questionInputRef = useRef(undefined);

  const setFormulation = form => setVariant({ ...variant, formulation: form });

  useEffect(() => {
    setQuestionVariant(variant);
  }, [variant]);

  useEffect(() => {
    setVariant(questionVariant);
    for (const type of translatedQuestionTypes)
      if (type.component.souceType === questionVariant.type) {
        questionInputRef.current = type.component;
        break;
      }

    if (!questionInputRef.current) {
      console.error(questionVariant, 'has bad type! Change to text type...');
      onChangeQuestionType(TEXT_QUESTION);
    } else {
      setQuestionType(questionInputRef.current.getInnerType(variant));
    }
  }, [questionVariant]);

  const onChangeQuestionType = type => {
    setQuestionType(type.value);
    questionInputRef.current = translatedQuestionTypes.find(x => x.value === type.value).component;

    let targetVariant = { ...variant };
    questionInputRef.current.init(targetVariant, type.value);
    setVariant(targetVariant);
  };

  const QuestionInput = questionInputRef.current;

  return (
    <View style={styles.container}>
      <InputForm
        multiline
        label={translate('tasks.question.variant.formulation')}
        value={clearHtmlTags(questionVariant.formulation)}
        onChange={setFormulation}
      />
      <View style={[styles.typeRow]}>
        <Text color={Color.silver} fontSize={14}>
          {translate('tasks.question.variant.type')}
        </Text>
        <Dropdown
          labelField="label"
          valueField="value"
          maxHeight={170}
          value={questionType}
          onChange={onChangeQuestionType}
          data={translatedQuestionTypes}
          style={styles.dropdown}
          selectedTextStyle={{ textAlign: 'right' }}
        />
      </View>
      <View style={[styles.variantAnswerContainer]}>
        {QuestionInput && <QuestionInput variant={questionVariant} setVariant={setQuestionVariant} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdown: {
    flex: 1,
    marginLeft: 20,
    maxWidth: 200,
  },
  variantAnswerContainer: {
    marginTop: 20,
  },
});

export default QuestionVariant;
