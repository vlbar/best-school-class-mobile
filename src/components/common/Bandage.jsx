import React from 'react';
import { StyleSheet } from 'react-native';
import Color from '../../constants';
import getContrastColor from '../../utils/ContrastColor';
import Text from './Text';

function Bandage({ title, color = Color.primary, size = 14 }) {
  return (
    <Text
      fontSize={size}
      style={[
        styles.bandage,
        {
          paddingHorizontal: size,
          paddingVertical: size / 6,
          backgroundColor: color,
          color: getContrastColor(color),
        },
      ]}
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  bandage: {
    paddingHorizontal: 10,
    borderRadius: 999,
  },
});

export default Bandage;
