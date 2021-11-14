import React from 'react';
import { Text, View, StyleSheet, TextInput } from 'react-native';

export default function InputForm({
  label,
  errorMessage,
  onChange,
  style,
  inputRef,
  ...props
}) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, errorMessage ? styles.errorInput : styles.input]}
        onChangeText={onChange}
        ref={inputRef}
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
    color: '#686868',
    fontSize: 14,
  },
  error: {
    color: '#dc3545',
    fontSize: 12,
  },
  input: {
    backgroundColor: '#EFF2F8',
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    fontSize: 17,
  },
  errorInput: {
    borderColor: '#dc3545',
  },
});
