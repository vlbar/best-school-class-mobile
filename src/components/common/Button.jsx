import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function Button({ title, onPress, style }) {
  return (
    <Pressable style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    backgroundColor: '#298AE5',
    paddingVertical: 12,
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontSize: 17,
  },
});
