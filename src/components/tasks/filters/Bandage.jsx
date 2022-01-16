import React from 'react';
import { StyleSheet } from 'react-native';

import Color from '../../../constants';
import getContrastColor from '../../../utils/ContrastColor';
import Text from '../../common/Text';

function Bandage({ title, color = Color.primary, size = 14, children }) {
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
      {title}{children}
    </Text>
  );
}

const styles = StyleSheet.create({
  bandage: {
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center'
  },
});

export default Bandage;
