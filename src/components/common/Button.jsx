import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Color from '../../constants';

export default function Button({ title, onPress, style, disabled }) {
  return (
    <Pressable
      style={[styles.button, style, disabled ? styles.disabled : null]}
      onPress={disabled ? null : onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    backgroundColor: Color.primary,
    paddingVertical: 12,
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontSize: 17,
  },
  disabled: {
    opacity: 0.5,
  },
});
