import React from 'react';
import { StyleSheet, View } from 'react-native';

import Color from '../../../constants';
import getContrastColor from '../../../utils/ContrastColor';
import Text from '../../common/Text';

function Bandage({ title, color = Color.primary, size = 14 }) {
  return (
    <View>
      <Text fontSize={size} style={[styles.bandage, { backgroundColor: color, color: getContrastColor(color) }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bandage: {
    paddingHorizontal: 10,
    borderRadius: 999,
  },
});

export default Bandage;
