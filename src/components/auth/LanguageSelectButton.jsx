import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Color from '../../constants';
import { getCurrentLanguage } from '../../utils/Internationalization';
import Text from '../common/Text';

export default function LanguageSelectButton({ onPress }) {
  const currentLanguage = getCurrentLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.centeredRow}>
        <TouchableOpacity style={styles.alignedRow} onPress={onPress}>
          <Text style={styles.language}>{currentLanguage.displayName}</Text>
          <Icon name={'chevron-down-outline'} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 5,
  },
  centeredRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  alignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  language: {
    textAlign: 'center',
    color: Color.silver,
    fontSize: 14,
  },
});
