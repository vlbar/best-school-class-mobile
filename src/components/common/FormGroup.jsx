import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function FormGroup({ children }) {
  const refs = useRef([]);

  function onSumbit(i) {
    if (i + 1 < children.length) refs.current[i + 1].focus();
  }

  function processRef(ref) {
    refs.current.push(ref);
  }

  return (
    <View>
      {children.map((child, i) => {
        return React.cloneElement(child, {
          key: i,
          onSubmitEditing: () => onSumbit(i),
          inputRef: processRef,
          returnKeyType: i < children.length - 1 ? 'next' : null,
          blurOnSubmit: i == children.length - 1,
        });
      })}
    </View>
  );
}
