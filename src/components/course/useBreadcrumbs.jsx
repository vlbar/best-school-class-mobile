import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import Text from '../common/Text';
import { StyleSheet } from 'react-native';
import Color from '../../constants';

function useBreadcrumbs(initialBreadcrumb, onPressCallback, displayField = 'name') {
  let initialCrumb;
  if (initialBreadcrumb instanceof String || typeof initialBreadcrumb === 'string') {
    const initialCrumbObj = {};
    initialCrumbObj[displayField] = initialBreadcrumb;
    initialCrumb = initialCrumbObj;
  } else {
    initialCrumb = initialBreadcrumb;
  }

  const [items, setItems] = useState([initialCrumb]);

  function push(item) {
    const prevItems = [...items];
    prevItems.push(item);
    setItems(prevItems);
  }

  function pop(count = 1) {
    const prevItems = [...items];
    if (prevItems.length <= 1) return;

    prevItems.splice(prevItems.length - 1);
    setItems(prevItems);

    onPressCallback?.(prevItems[prevItems.length - 1]);
  }

  const onPress = item => {
    const index = items.indexOf(item);
    if (index === items.length - 1) return;

    const prevItems = [...items];
    prevItems.splice(index + 1);
    setItems(prevItems);

    onPressCallback?.(item);
  };

  const Breadcrumbs = ({ style }) => {
    return (
      <View style={[styles.container, style]}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <View key={index} style={styles.breadcrumb}>
              <Pressable onPress={() => onPress(item)}>
                <Text style={[styles.breadcrumbText, isLast && styles.lastBreadcrumb]}>{item[displayField]}</Text>
              </Pressable>
              {!isLast && <Text style={styles.breadcrumbText}>/</Text>}
            </View>
          );
        })}
      </View>
    );
  };

  return [push, pop, Breadcrumbs];
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginRight: 'auto',
  },
  breadcrumb: {
    flexDirection: 'row',
  },
  breadcrumbText: {
    color: Color.silver,
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  lastBreadcrumb: {
    color: Color.darkGray,
  },
});

export default useBreadcrumbs;
