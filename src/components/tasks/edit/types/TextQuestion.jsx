import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import Color from '../../../../constants';
import InputForm from '../../../common/InputForm';
import Text from '../../../common/Text';
import { useTranslation } from './../../../../utils/Internationalization';

const SOURCE_TYPE = 'TEXT_QUESTION';
export const TEXT_QUESTION = 'TEXT_QUESTION';

function TextQuestion({ variant, setVariant }) {
  const { translate } = useTranslation();

  const [numberOfSymbols, setNumberOfSymbols] = useState(variant.numberOfSymbols);

  useEffect(() => {
    const prevVarinat = { ...variant };
    variant.numberOfSymbols = numberOfSymbols;
    setVariant(prevVarinat);
  }, [numberOfSymbols]);

  return (
    <View style={styles.row}>
      <Text style={styles.rowText} fontSize={14}>
        {translate('tasks.question.variant.textQuestion.numberOfSymbols')}
      </Text>
      <InputForm
        value={numberOfSymbols}
        onChange={value => setNumberOfSymbols(value)}
        style={styles.rowInput}
        keyboardType="numeric"
      />
    </View>
  );
}

const getInnerType = variant => {
  return TEXT_QUESTION;
};

const init = variant => {
  variant.type = SOURCE_TYPE;
  return variant;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowText: {
    color: Color.silver,
    marginBottom: 10,
  },
  rowInput: {
    maxWidth: 120,
  },
});

TextQuestion.souceType = SOURCE_TYPE;
TextQuestion.innerType = TEXT_QUESTION;
TextQuestion.getInnerType = getInnerType;
TextQuestion.init = init;
export default TextQuestion;
