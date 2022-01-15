import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import Text from '../common/Text';
import Color from '../../constants';
import { getI } from '../../utils/Internationalization';

const pPrefixKey = 'common.input-placeholder-prefix';
const pPostfixKey = 'common.input-placeholder-postfix';

export default function InputForm({
  label,
  errorMessage,
  onChange,
  style,
  inputRef,
  placeholder,
  autoplaceholder = true,
  ...props
}) {
  let placeholderText = placeholder;
  if (!placeholderText && autoplaceholder) {
    let placeholderPrefix = getI(pPrefixKey);
    let placeholderPostfix = getI(pPostfixKey);

    placeholderText = label ?
      (placeholderPrefix
        ? placeholderPrefix + ' ' + label.toLowerCase()
        : label) +
      (placeholderPostfix ? ' ' + placeholderPostfix : '') +
      '...' : getI(pPrefixKey);
  }

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, errorMessage ? styles.errorInput : styles.input]}
        onChangeText={onChange}
        ref={inputRef}
        placeholder={placeholderText}
        {...props}
      />
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    color: Color.gray,
    fontSize: 14,
  },
  error: {
    color: Color.danger,
    fontSize: 12,
  },
  input: {
    backgroundColor: Color.ultraLightPrimary,
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    fontSize: 17,
  },
  errorInput: {
    borderColor: Color.danger,
  },
});
