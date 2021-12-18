import React, { useRef } from 'react';
import { Animated } from 'react-native';
import Color from '../../constants';

function ProcessView({
  height = 50,
  width = '100%',
  backgroundColor = Color.grayPrimary,
  borderRadius = 10,
  style,
}) {
  const load = useRef(new Animated.Value(0)).current;
  useRef(
    Animated.loop(
      Animated.timing(load, {
        toValue: 2,
        duration: 1600,
        useNativeDriver: true,
      }),
    ).start(),
  );

  return (
    <Animated.View
      style={[
        { height, width, backgroundColor, borderRadius },
        {
          opacity: load.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [0.5, 1, 0.5],
          }),
        },
        style,
      ]}
    />
  );
}

export default ProcessView;
