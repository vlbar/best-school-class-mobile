import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

function IconButton({ name, size = 28, color, onPress, style, disabled = false }) {
  return (
    <TouchableOpacity style={[styles.button, disabled && styles.disabled, style]} disabled={disabled} onPress={onPress}>
      <Icon name={name} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 6,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default IconButton;
