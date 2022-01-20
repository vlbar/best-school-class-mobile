import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Color from '../../constants';
import { getI } from '../../utils/Internationalization';
import Bandage from './Bandage';
import Text from './Text';

export default function Sort({ orders, value, onSelect, title, bandageSize = 18 }) {
  return (
    <View>
      <Text>{title ?? getI('common.filters.sortBy')}</Text>
      <View style={styles.bandageList}>
        {Object.keys(orders).map((order, index) => {
          return (
            <Pressable key={index} onPress={() => onSelect(order)} style={styles.bandage}>
              <Bandage
                title={orders[order]}
                size={bandageSize}
                color={order === value ? Color.primary : Color.veryLightGray}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bandageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  bandage: {
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 999,
    textAlign: 'center',
  },
});
