import React from 'react';
import { StyleSheet } from 'react-native';
import Text from './Text';

export default function ErrorAlert({ message, style }) {
  return message ? <Text style={[styles.error, style]}>{message}</Text> : null;
}

const styles = StyleSheet.create({
  error: {
    color: '#87212b',
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#f8d7da',
    borderRadius: 5,
    padding: 12,
    marginVertical: 5,
  },
});
