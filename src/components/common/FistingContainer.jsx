import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function FistingContainer({ children, marginHorizontal = 10, style, wrapStyle }) {
  return (
    <View style={[styles.container, { marginHorizontal: -marginHorizontal }, style]}>
      {children.map(
        (child, index) =>
          child &&
          React.cloneElement(child, {
            key: index,
            style: { ...styles.wrapper, marginHorizontal, ...child.props?.style, ...wrapStyle },
          }),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wrapper: {
    flexGrow: 1,
  },
});
