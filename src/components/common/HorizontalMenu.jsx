import React, { useRef, useState } from 'react';
import { Children } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Color from '../../constants';
import Text from './Text';

function HorizontalMenu({ children, style }) {
  const [selected, setSelected] = useState(undefined);
  const firstItem = useRef(undefined);

  const onPressHandler = value => {
    setSelected(value);
  };

  let items = Children.map(children, (child, i) => {
    if (firstItem.current == undefined) {
      setSelected(i);
      firstItem.current = i;
    }
    return React.cloneElement(child, {
      __contextValue: i,
      __contextSelected: selected,
      __contextOnPress: () => onPressHandler(i),
    });
  });

  return (
    <View>
      <View style={[styles.container, style]}>{items}</View>
      <View>
        {items.map((item, index) => {
          return (
            <View style={{ display: index === selected ? 'flex' : 'none' }} key={index}>
              {item.props.children}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function HorizontalMenuItem({ title, onPress, style, __contextValue, __contextSelected, __contextOnPress }) {
  const onPressHandler = () => {
    onPress?.();
    __contextOnPress?.();
  };

  let isActive = __contextValue === __contextSelected;
  return (
    <Pressable onPress={onPressHandler} style={[styles.item]}>
      <Text numberOfLines={1} style={[styles.title, isActive && styles.active, style]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Color.ultraLightPrimary,
    borderRadius: 999,
    flexDirection: 'row',
  },
  item: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    color: Color.darkGray,
    paddingVertical: 6,
    borderRadius: 999,
  },
  active: {
    backgroundColor: Color.lightPrimary,
    color: Color.white,
  },
});

HorizontalMenu.Item = HorizontalMenuItem;
export default HorizontalMenu;
