import React from 'react';
import { Modal as NativeModal, TouchableWithoutFeedback, View } from 'react-native';
import { StyleSheet } from 'react-native';
import Color from '../../constants';
import IconButton from './IconButton';
import Text from './Text';

export default function Modal({ show, onClose, title, children, fullscreen, modalViewStyle }) {
  return (
    <NativeModal animationType="fade" transparent={true} visible={show} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.outside}></View>
        </TouchableWithoutFeedback>
        <View style={[styles.modalView, fullscreen && { width: '100%', height: '100%' }, modalViewStyle]}>
          <View style={styles.modalHeader}>
            <Text weight="medium" style={styles.modalTitle}>
              {title}
            </Text>
            <IconButton name="close" onPress={onClose} style={styles.modalClose} />
          </View>
          {children}
        </View>
      </View>
    </NativeModal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000AA',
  },
  outside: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  modalView: {
    width: '80%',
    marginHorizontal: 40,
    backgroundColor: Color.white,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  modalTitle: {
    textAlign: 'center',
    paddingVertical: 10,
    color: Color.black,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    right: 0,
    padding: 0,
  },
});
