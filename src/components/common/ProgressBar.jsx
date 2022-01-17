import React from 'react';
import { View, StyleSheet } from 'react-native';''
import Color from '../../constants';

export default function ProgressBar({ max = 100, min = 0, value, color = Color.primary, style }) {
  return (
    <View style={[styles.progress, style]}>
      <View
        style={[styles.fill, { backgroundColor: color, width: `${Math.floor(((value - min) / (max - min)) * 100)}%` }]}
      ></View>
    </View>
  );
}

const styles = StyleSheet.create({
  progress: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Color.veryLightGray,
    marginVertical: 10,
  },
  fill: {
    borderRadius: 999,
    height: '100%',
  },
});
