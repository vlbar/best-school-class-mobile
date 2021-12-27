import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import Button from './../../../common/Button';
import Check from '../../../common/Check';
import Color from '../../../../constants';
import IconButton from '../../../common/IconButton';
import InputForm from '../../../common/InputForm';
import { useTranslation } from '../../../../utils/Internationalization';

const SOURCE_TYPE = 'TEST_QUESTION';
export const TEST_QUESTION = 'TEST_QUESTION';
export const TEST_MULTI_QUESTION = 'TEST_MULTI_QUESTION';

function TestQuestion({ variant, setVariant }) {
  const { translate } = useTranslation();

  const focusedOn = useRef(undefined);

  const setAnswers = answers => {
    const prevVarinat = variant;
    variant.testAnswerVariants = answers;
    setVariant(prevVarinat);
  };

  const addNewAnswer = () => {
    if (variant.testAnswerVariants.length < 10) {
      const newAnswer = { id: Math.random(), detached: true, answer: '' };
      setAnswers([...variant.testAnswerVariants, newAnswer]);

      focusedOn.current = newAnswer.id;
    }
  };

  const onCheckAnswer = (id, isRight) => {
    const prevAnswers = [...variant.testAnswerVariants];
    prevAnswers.find(x => x.id === id).isRight = isRight;
    setAnswers(prevAnswers);
  };

  const removeAnswer = answer => {
    setAnswers(variant.testAnswerVariants.filter(x => x.id !== answer.id));
  };

  return (
    <View style={styles.container}>
      <Check.Group onChange={answer => onCheckAnswer(answer.name, answer.value)}>
        {variant?.testAnswerVariants?.map(item => {
          return (
            <View key={item.id} style={styles.answer}>
              <Check
                name={item.id}
                checked={item.isRight}
                type={variant.isMultipleAnswer ? 'checkbox' : 'radio'}
                style={styles.check}
              />
              <InputForm
                multiline
                value={item.answer}
                style={styles.answerInput}
                autoFocus={focusedOn.current === item.id}
              />
              <IconButton name="close-outline" style={styles.answerIcon} onPress={() => removeAnswer(item)} />
            </View>
          );
        })}
      </Check.Group>
      {variant?.testAnswerVariants?.length < 10 && (
        <Button
          title={translate('tasks.questions.variant.testQuestion.addAnswer')}
          color={Color.ultraLightPrimary}
          textColor={Color.darkGray}
          onPress={addNewAnswer}
          styles={styles.button}
        />
      )}
    </View>
  );
}

const getInnerType = variant => {
  return variant.isMultipleAnswer ? TEST_MULTI_QUESTION : TEST_QUESTION;
};

const init = (variant, type) => {
  variant.type = SOURCE_TYPE;
  variant.isMultipleAnswer = type === TEST_MULTI_QUESTION;

  if (!variant.isMultipleAnswer) {
    let answers = variant.testAnswerVariants;
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

TestQuestion.getInnerType = getInnerType;
TestQuestion.souceType = SOURCE_TYPE;
TestQuestion.innerType = [TEST_QUESTION, TEST_MULTI_QUESTION];
TestQuestion.init = init;
export default TestQuestion;
