import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

function ProcessBar({ height = 6, active = true, style }) {
  const load = useRef(new Animated.Value(0)).current;
  const animation = useRef(
    Animated.loop(
      Animated.timing(load, {
        toValue: 2,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ),
  ).current;

  const stopAnimation = useRef(
    Animated.timing(load, {
      toValue: 0,
      duration: 1,
      useNativeDriver: false,
    }),
  ).current;

  useEffect(() => {
    load.setValue(0);
    if (active) animation.start();
    else stopAnimation.start();
  }, [active]);

  return (
    <View style={[active && styles.background, style, { height: height }]}>
      {active && (
        <Animated.View
          style={[
            styles.fill,
            {
              width: load.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              left: load.interpolate({
                inputRange: [1, 2],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        ></Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#F4F2F2',
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    backgroundColor: '#298AE5',
    borderRadius: 999,
  },
});

export default ProcessBar;
