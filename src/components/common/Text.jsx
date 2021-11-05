import React from 'react';
import { StyleSheet, Text as NativeText } from 'react-native';

export const BOLD_WEIGHT = 'bold';
export const MEDIUM_WEIGHT = 'medium';
export const NORMAL_WEIGHT = 'normal';
export const LIGHT_WEIGHT = 'light';

function Text({ children, weight = NORMAL_WEIGHT, style }) {
  const getFontWidth = () => {
    switch(weight.toLowerCase()) {
      case BOLD_WEIGHT:
        return 'Inter-Bold'
      case MEDIUM_WEIGHT:
        return 'Inter-Medium'
      case LIGHT_WEIGHT:
        return 'Inter-Light'
      default:
        return 'Inter-Regular'
    }
  }

  return <NativeText style={[styles.text, getFontWidth(), style]}>{children}</NativeText>;
}

const styles = StyleSheet.create({
  text: {
    color: '#343434',
    fontSize: 17,
  },
});

export const BestText = Text;
export default Text;
