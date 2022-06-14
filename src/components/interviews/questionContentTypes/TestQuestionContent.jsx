import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Color from '../../../constants';
import { useTranslation } from '../../../utils/Internationalization';
import Check from '../../common/Check';
import Text from '../../common/Text';

export function TestQuestionContent({ question, short }) {
  const { translate } = useTranslation();

  if (short) {
    return (
      <Text style={styles.answer}>
        {translate('homeworks.interview.testAnswersSelected_interval', {
          postProcess: 'interval',
          count: question.questionAnswer.selectedAnswerVariantsIds.length,
        })}
      </Text>
    );
  } else {
    return (
      <View>
        {question.questionVariant.testAnswerVariants.map(testAnswer => {
          const isChecked = question.questionAnswer?.selectedAnswerVariantsIds?.find(x => x === testAnswer.id) != null;
          const isRight = isChecked && testAnswer.right;
          return (
            <View key={testAnswer.id} style={styles.answer}>
              <Check
                name={testAnswer.id}
                checked={isChecked}
                title={testAnswer.answer}
                type={question.questionVariant.isMultipleAnswer ? 'checkbox' : 'radio'}
                readonly={true}
                borderColor={testAnswer.right && (isRight ? Color.success : Color.danger)}
                color={isRight ? Color.success : Color.danger}
                style={{ paddingVertical: 5 }}
              />
            </View>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  answer: {
    color: Color.gray,
    fontSize: 16,
    flex: 1,
  },
});
