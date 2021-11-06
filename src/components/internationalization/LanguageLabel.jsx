import React from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getCurrentLanguage } from '../../utils/Internationalization';
import Text from './../common/Text';
import Color from './../../constants';

function LanguageLabel({ onPress }) {
  const currentLanguage = getCurrentLanguage();

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.container}>
        <Icon name="globe-outline" size={18} color={Color.silver} />
        <Text style={styles.label}>{currentLanguage.displayName}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
  },
  label: {
    marginLeft: 10,
    fontSize: 14,
    color: Color.silver,
  },
});

export default LanguageLabel;
