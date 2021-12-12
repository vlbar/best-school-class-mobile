import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import Color from '../../constants';
import Text from './Text';

export default function Button({
  // text
  title,
  textSize = 17,
  textColor = Color.white,
  textAlign,
  // button
  color = Color.primary,
  onPress,
  disabled,
  right,
  left,
  // icon
  iconName,
  iconSize,

  style,
}) {
  const styles = StyleSheet.create({
    button: {
      borderRadius: 10,
      backgroundColor: color,
      padding: 12,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: textColor,
      textAlign: textAlign ?? (iconName ? 'left' : 'center'),
      fontSize: textSize,
      flex: 1,
    },
    icon: {
      marginRight: 10,
    },
    disabled: {
      opacity: 0.5,
    },
  });

  return (
    <Pressable style={[styles.button, disabled && styles.disabled, style]} onPress={onPress}>
      {left}
      {iconName && <Icon name={iconName} size={iconSize ?? textSize * 1.2} color={textColor} style={styles.icon} />}
      {title && <Text style={[styles.text, { fontSize: textSize }]}>{title}</Text>}
      {right}
    </Pressable>
  );
}
