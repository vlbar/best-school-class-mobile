import React, { useRef, useState } from 'react';
import { Children } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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

  return <View style={[styles.container, style]}>{items}</View>;
}

function HorizontalMenuItem({
  title,
  onPress,
  style,
  __contextValue,
  __contextSelected,
  __contextOnPress,
}) {
  const onPressHandler = () => {
    onPress?.();
    __contextOnPress?.();
  };

  let isActive = __contextValue === __contextSelected;
  return (
    <Pressable onPress={onPressHandler} style={[styles.item]}>
      <Text style={[styles.title, isActive && styles.active, style]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#EFF2F8',
    borderRadius: 999,
    flexDirection: 'row',
  },
  item: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    color: 'black',
    paddingVertical: 6,
    borderRadius: 999,
  },
  active: {
    backgroundColor: '#51A3FD',
    color: 'white',
  },
});

HorizontalMenu.Item = HorizontalMenuItem;
export default HorizontalMenu;
