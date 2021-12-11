import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import Color from '../../constants';

export default function ColorPicker({
  colors,
  value,
  onChange,
  circleSize,
  circleMargin = 10,
  circlePadding = 20,
  growTime = 200,
}) {
  const growAnim = useRef(new Animated.Value(1)).current;

  const growIn = () => {
    Animated.timing(growAnim, {
      toValue: 1,
      duration: growTime,
      useNativeDriver: false,
    }).start();
  };

  function onSelect(color) {
    if (color == value) return;

    growAnim.setValue(0);
    growIn();
    onChange(color);
  }

  return (
    <View style={styles.container}>
      {colors.map((color, index) => {
        const active = color == value;
        return (
          <View
            key={index}
            style={[
              { padding: circleMargin ?? 0 },
              circleSize
                ? {
                    width: circleSize,
                    height: circleSize,
                  }
                : { flex: 1, aspectRatio: 1 },
            ]}
          >
            <TouchableWithoutFeedback onPress={() => onSelect(color)}>
              <View style={[styles.colorCircle, { backgroundColor: color }]}>
                {active && (
                  <Animated.View
                    style={{
                      width: growAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', 100 - circlePadding + '%'],
                      }),
                      aspectRatio: 1,
                      borderRadius: 50,
                      backgroundColor: Color.white,
                    }}
                  ></Animated.View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  colorCircle: {
    borderRadius: 50,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
});
