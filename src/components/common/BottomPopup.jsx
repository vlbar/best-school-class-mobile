import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import Text from './Text';
import IconButton from './IconButton';
import Container from './Container';
import Color from '../../constants';

function BottomPopup({ show = true, title, onClose, children }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (show) {
      translateY.setValue(0);
      Animated.timing(translateY, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [show]);

  const onCloseHandler = () => {
    translateY.setValue(1);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
    onClose?.();
  };

  let transform = {
    transform: [
      {
        translateY: translateY.interpolate({
          inputRange: [0, 1],
          outputRange: [100, 0],
        }),
      },
    ],
  };
  return (
    <Modal animationType="fade" transparent={true} visible={show} onRequestClose={onCloseHandler}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={onCloseHandler}>
          <View style={styles.popOutside}></View>
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.popup, transform]}>
          <View style={styles.header}>
            <Text weight="medium" style={styles.title}>
              {title}
            </Text>
            <IconButton name="close" onPress={onCloseHandler} style={styles.close} />
          </View>
          <View>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000000AA',
  },
  popOutside: {
    flex: 1,
  },
  popup: {
    width: '100%',
    backgroundColor: Color.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 10,
    color: Color.black,
  },
  close: {
    position: 'absolute',
    right: 0,
    padding: 10,
  },
});

export default BottomPopup;
