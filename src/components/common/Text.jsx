import React from 'react';
import { Text as NativeText } from 'react-native';
import Color from '../../constants';

export const BOLD_WEIGHT = 'bold';
export const MEDIUM_WEIGHT = 'medium';
export const NORMAL_WEIGHT = 'normal';
export const LIGHT_WEIGHT = 'light';

function Text({ children, weight = NORMAL_WEIGHT, color = Color.darkGray, fontSize = 17, style, ...props }) {
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

  return <NativeText style={[{ fontFamily: getFontWidth(), color, fontSize }, style]} {...props}>{children}</NativeText>;
}

export const BestText = Text;
export default Text;