import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

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
      paddingVertical: 12,
      paddingHorizontal: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: textColor,
      textAlign: textAlign ?? (iconName ? 'left' : 'center'),
      fontSize: textSize,
      flexGrow: 1,
    },
    icon: {
      marginRight: 10,
    },
    disabled: {
      opacity: 0.7,
    },
  });

  return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} disabled={disabled}>
        <View style={[styles.button, disabled && styles.disabled, style]}>
          {left}
          {iconName && <Icon name={iconName} size={iconSize ?? textSize * 1.2} color={textColor} style={styles.icon} />}
          {title && <Text style={[styles.text, { fontSize: textSize }]}>{title}</Text>}
          {right}
        </View>
    </TouchableOpacity>
  );
}
