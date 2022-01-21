import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import Button from './../../../common/Button';
import Check from '../../../common/Check';
import Color from '../../../../constants';
import IconButton from '../../../common/IconButton';
import { BestValidation } from '../../../../utils/useBestValidation';
import { useTranslation } from '../../../../utils/Internationalization';

const SOURCE_TYPE = 'TEST_QUESTION';
export const TEST_QUESTION = 'TEST_QUESTION';
export const TEST_MULTI_QUESTION = 'TEST_MULTI_QUESTION';

function TestQuestion({ variant, setVariant, variantValidation }) {
  const { translate } = useTranslation();
  const focusedOn = useRef(undefined);

  const setAnswers = answers => {
    const prevVarinat = variant;
    variant.testAnswerVariants = answers;
    setVariant(prevVarinat);
  };

  const addNewAnswer = () => {
    if (variant.testAnswerVariants.length < 10) {
      const newAnswer = { key: Math.random(), answer: '', isRight: false };
      let testAnswerVariants = [...variant.testAnswerVariants, newAnswer];
      setAnswers(testAnswerVariants);

      variantValidation.changeHandle('testAnswerVariants', testAnswerVariants);
      focusedOn.current = newAnswer.key;
    }
  };

  const onAnswerChange = (key, callback) => {
    const prevAnswers = [...variant.testAnswerVariants];
    callback(prevAnswers.find(x => x.key === key));
    setAnswers(prevAnswers);
    variantValidation.changeHandle('testAnswerVariants', prevAnswers);
  };

  const removeAnswer = answer => {
    console.log(answer);
    setAnswers(variant.testAnswerVariants.filter(x => x.key !== answer.key));
  };

  return (
    <View style={styles.container}>
      <BestValidation.Context validation={variantValidation} entity={variant}>
        <BestValidation.ErrorMessage name="testAnswerVariants" />
        <Check.Group onChange={answer => onAnswerChange(answer.name, x => (x.isRight = answer.value))}>
          {variant?.testAnswerVariants?.map((item, index) => {
            const key = item.key;
            return (
              <View key={key} style={styles.answer}>
                <Check
                  name={key}
                  checked={item.isRight}
                  type={variant.isMultipleAnswer ? 'checkbox' : 'radio'}
                  style={styles.check}
                />
                <BestValidation.InputForm
                  name={`testAnswerVariants[${index}].answer`}
                  multiline
                  value={item.answer}
                  onChange={value => onAnswerChange(key, x => (x.answer = value))}
                  autoFocus={focusedOn.current === key}
                  style={styles.answerInput}
                />
                <IconButton name="close-outline" style={styles.answerIcon} onPress={() => removeAnswer(item)} />
              </View>
            );
          })}
        </Check.Group>
        {variant?.testAnswerVariants?.length < 10 && (
          <Button
            title={translate('tasks.question.variant.testQuestion.addAnswer')}
            color={Color.ultraLightPrimary}
            textColor={Color.darkGray}
            onPress={addNewAnswer}
            styles={styles.button}
          />
        )}
      </BestValidation.Context>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 10,
  },
  answer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerInput: {
    flex: 1,
  },
  answerIcon: {
    paddingBottom: 20,
  },
  check: {
    paddingBottom: 20,
    marginRight: 10,
  },
});

const getInnerType = variant => {
  return variant.isMultipleAnswer ? TEST_MULTI_QUESTION : TEST_QUESTION;
};

const init = (variant, type) => {
  variant.type = SOURCE_TYPE;
  variant.isMultipleAnswer = type === TEST_MULTI_QUESTION;
  let answers = variant?.testAnswerVariants ?? [];
  console.log(answers);
  answers.forEach(x => {
    x.key = x.id;
  });

  if (!variant.isMultipleAnswer) {
    let forceRight = true;
    answers.forEach(answer => {
      if (answer.isRight) {
        answer.isRight = forceRight;
        forceRight = false;
      }
    });

    variant.testAnswerVariants = answers;
  }
};

const getValidationSchema = translate => {
  return {
    testAnswerVariants: {
      type: 'array',
      of: {
        answer: {
          type: 'string',
          required: [translate('tasks.question.variant.testQuestion.validation.answer.required')],
          max: [1024, translate('tasks.question.variant.testQuestion.validation.answer.maxLenght')],
        },
      },
      required: [translate('tasks.question.variant.testQuestion.validation.empty')],
      min: [2, translate('tasks.question.variant.testQuestion.validation.minCount', { min: 2 })],
      custom: {
        noRight: [validateIsRight, translate('tasks.question.variant.testQuestion.validation.noRight')],
      },
    },
  };
};

function validateIsRight(answers) {
  for (const answer of answers) if (answer.isRight) return true;
  return false;
}

TestQuestion.getValidationSchema = getValidationSchema;
TestQuestion.getInnerType = getInnerType;
TestQuestion.souceType = SOURCE_TYPE;
TestQuestion.innerType = [TEST_QUESTION, TEST_MULTI_QUESTION];
TestQuestion.init = init;
export default TestQuestion;
