import React from 'react';
import { StyleSheet, View } from 'react-native';

import Color from '../../../../constants';
import Text from '../../../common/Text';
import { BestValidation } from '../../../../utils/useBestValidation';
import { useTranslation } from './../../../../utils/Internationalization';

const SOURCE_TYPE = 'TEXT_QUESTION';
export const TEXT_QUESTION = 'TEXT_QUESTION';

function TextQuestion({ variant, setVariant, variantValidation }) {
  const { translate } = useTranslation();

  const setNumberOfSymbols = numberOfSymbols => setVariant({ ...variant, numberOfSymbols });

  return (
    <BestValidation.Context validation={variantValidation} entity={variant}>
      <View style={styles.row}>
        <Text style={styles.rowText} fontSize={14}>
          {translate('tasks.question.variant.textQuestion.numberOfSymbols')}
        </Text>
        <BestValidation.InputForm
          name="numberOfSymbols"
          hideErrorMessage
          keyboardType="numeric"
          onChange={value => setNumberOfSymbols(value)}
          style={styles.rowInput}
        />
      </View>
      <BestValidation.ErrorMessage name="numberOfSymbols" />
    </BestValidation.Context>
  );
}

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

const getInnerType = variant => {
  return TEXT_QUESTION;
};

const init = variant => {
  variant.type = SOURCE_TYPE;
  return variant;
};

const getValidationSchema = translate => {
  return {
    numberOfSymbols: {
      type: 'number',
      nullable: true,
      min: [1, translate('tasks.question.variant.textQuestion.validation.numberOfSymbolsMin', { min: 1 })],
      max: [9223372036854775807, translate('tasks.question.variant.textQuestion.validation.numberOfSymbolsMax')],
    },
  };
};

TextQuestion.getValidationSchema = getValidationSchema;
TextQuestion.souceType = SOURCE_TYPE;
TextQuestion.innerType = TEXT_QUESTION;
TextQuestion.getInnerType = getInnerType;
TextQuestion.init = init;
export default TextQuestion;
