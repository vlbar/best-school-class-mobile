import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Ionicons';

import Color from '../../../constants';
import TestQuestion, { TEST_MULTI_QUESTION, TEST_QUESTION } from './types/TestQuestion';
import Text from '../../common/Text';
import TextQuestion, { TEXT_QUESTION } from './types/TextQuestion';
import useBestValidation, { BestValidation } from '../../../utils/useBestValidation';
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

function QuestionVariant({ show = true, questionVariant, setQuestionVariant, showDeleteVariantAlert }, ref) {
  const { translate } = useTranslation();
  const translatedQuestionTypes = questionTypes.map(x => {
    x.label = translate(x.labelKey);
    return x;
  });

  const [questionType, setQuestionType] = useState(TEXT_QUESTION);
  const questionInputRef = useRef(questionTypes[0].component);

  const genericVariantValidationSchema = {
    formulation: {
      type: 'string',
      required: [translate('tasks.question.variant.validation.formulationRequired')],
      min: [5, translate('tasks.question.variant.validation.formulationMin', { min: 5 })],
      max: [1024, translate('tasks.question.variant.validation.formulationMax')],
    },
  };

  const validationSchema = useRef(genericVariantValidationSchema);
  const variantValidation = useBestValidation(validationSchema.current);

  const setFormulation = formulation => setQuestionVariant({ ...questionVariant, formulation });

  useImperativeHandle(ref, () => ({
    validate: () => {
      return variantValidation.validate(questionVariant);
    },
  }));

  useEffect(() => {
    for (const type of translatedQuestionTypes)
      if (type.component.souceType === questionVariant.type) {
        questionInputRef.current = type.component;
        break;
      }

    if (!questionInputRef.current) {
      console.error(questionVariant, 'has bad type! Change to text type...');
      onChangeQuestionType(TEXT_QUESTION);
    } else {
      validationSchema.current = {
        ...genericVariantValidationSchema,
        ...questionInputRef.current.getValidationSchema(translate),
      };

      setQuestionType(questionInputRef.current.getInnerType(questionVariant));
    }
  }, []);

  useEffect(() => {
    if (questionVariant?.isValid === false) {
      variantValidation.validate(questionVariant);
    }
  }, [questionType])

  const onChangeQuestionType = type => {
    questionInputRef.current = translatedQuestionTypes.find(x => x.value === type.value).component;

    validationSchema.current = {
      ...genericVariantValidationSchema,
      ...questionInputRef.current.getValidationSchema(translate),
    };
    setQuestionType(type.value);

    let targetVariant = { ...questionVariant };
    questionInputRef.current.init(targetVariant, type.value);
    setQuestionVariant(targetVariant);
  };

  const varinatActionsList = [
    { label: translate('tasks.question.variant.addLink'), action: () => console.log('cringe') },
    { label: translate('tasks.question.variant.delete'), action: () => showDeleteVariantAlert() },
  ];

  const variantAction = () => {
    return (
      <View style={styles.actions}>
        <DropdownButton data={varinatActionsList} />
      </View>
    );
  };

  const QuestionInput = questionInputRef.current;

  if (!show) return <></>;
  return (
    <View style={styles.container}>
      {variantAction()}
      <BestValidation.Context validation={variantValidation} entity={questionVariant}>
        <BestValidation.InputForm
          name="formulation"
          multiline
          label={translate('tasks.question.variant.formulation')}
          value={clearHtmlTags(questionVariant?.formulation)}
          onChange={setFormulation}
        />
      </BestValidation.Context>
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
        {QuestionInput && (
          <QuestionInput
            variant={questionVariant}
            setVariant={setQuestionVariant}
            variantValidation={variantValidation}
          />
        )}
      </View>
    </View>
  );
}

function DropdownButton({ data, textAlign = 'right', maxHeight }) {
  const dropdownMenu = data.map(x => {
    x.value = x.label;
    return x;
  });

  const onChageHadle = (value) => {
    value.action?.();
  };

  const renderItem = item => {
    if (item.value === 0) return <></>;
    return <Text style={[styles.dropdownButtonItem, { textAlign }]}>{item.label}</Text>;
  };

  return (
    <Dropdown
      labelField="label"
      valueField="value"
      renderItem={renderItem}
      data={dropdownMenu}
      value={dropdownMenu[0].value}
      maxHeight={maxHeight ?? dropdownMenu.length * 46}
      renderRightIcon={() => <Icon name="ellipsis-horizontal-outline" size={28} />}
      onChange={onChageHadle}
      selectedTextStyle={{ color: 'transparent' }}
      activeColor={'transparent'}
    />
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
  actions: {
    position: 'absolute',
    right: 0,
    top: -6,
    width: 200,
    zIndex: 2,
    elevation: 2,
  },
  dropdownButtonItem: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});

QuestionVariant = forwardRef(QuestionVariant);
export default QuestionVariant;
