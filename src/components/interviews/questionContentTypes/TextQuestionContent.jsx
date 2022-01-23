import React from 'react';
import { StyleSheet } from 'react-native';
import Color from '../../../constants';
import { useTranslation } from '../../../utils/Internationalization';
import Text from '../../common/Text';

export function TextQuestionContent({ question, short = false }) {
  const { translate } = useTranslation();

  return (
    <Text numberOfLines={short ? 1 : undefined} style={styles.answer}>
      {question.questionAnswer?.content ?? translate('homeworks.try.noAnswer')}
    </Text>
  );
}

const styles = StyleSheet.create({
  answer: {
    color: Color.gray,
    fontSize: 16,
    flex: 1,
  },
});
