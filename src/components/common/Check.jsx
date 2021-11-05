import React, { createContext, useContext, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Text from './Text';

export const RADIO_TYPE = 'radio';
export const CHECKBOX_TYPE = 'checkbox';
export const SWITCH_TYPE = 'switch';

function Item({
  type,
  title,
  subtitle,
  color,
  borderColor,
  disabled,
  readonly,
  name,
  checked,
  onChange,
  style,
}) {
  const { contextSelected, contextOnChange } = useCheckContext(CheckContext);
  const [isChecked, setIsChecked] = useState(
    checked != undefined ? checked : false,
  );

  if (name == undefined) {
    name = title;
  }

  const onPressHandler = () => {
    if (readonly || disabled) return;
    let isCheckedTarget = !isChecked;
    if (type === RADIO_TYPE && isChecked) return;

    setIsChecked(isCheckedTarget);
    onChange?.(isCheckedTarget);

    contextOnChange?.({ name, value: isCheckedTarget });
  };

  useEffect(() => {
    if (contextSelected === undefined) return;
    if (type === RADIO_TYPE) {
      setIsChecked(contextSelected == name);
    }
  }, [contextSelected]);

  let props = { active: isChecked, disabled, color, borderColor };
  const getCheckIndicator = () => {
    switch (type?.toLowerCase()) {
      case RADIO_TYPE:
        return <Radiomark {...props} />;
      case SWITCH_TYPE:
        return <Switch {...props} />;
      default:
        return <Checkbox {...props} />;
    }
  };

  return (
    <Pressable style={[styles.item, style]} onPress={onPressHandler}>
      {getCheckIndicator()}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, disabled && styles.disabled]}>
          {title ? title : name}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, disabled && styles.disabled]}>
            {subtitle}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

// Container
const CheckContext = createContext();
function Group({ defaultValue, onChange, children }) {
  const [selected, setSelected] = useState(defaultValue);

  const onChangeHandler = target => {
    onChange?.(target);
    setSelected(target.name);
  };

  return (
    <CheckContext.Provider
      value={{
        contextSelected: selected,
        contextOnChange: onChangeHandler,
      }}
    >
      {children}
    </CheckContext.Provider>
  );
}

function useCheckContext() {
  const context = useContext(CheckContext);
  if (!context) return {};
  else return context;
}

// Check marks
export function Checkbox({
  size = 24,
  active,
  disabled,
  color = '#298AE5',
  borderColor = '#9B9B9B',
  style,
}) {
  const checkbox = StyleSheet.create({
    normal: {
      width: size,
      height: size,

      borderRadius: 4,
      borderWidth: 2,
      borderColor: borderColor,

      alignItems: 'center',
      justifyContent: 'center',
    },
    active: {
      borderWidth: 0,
      backgroundColor: color,
    },
  });

  return (
    <View
      style={[
        checkbox.normal,
        active && checkbox.active,
        disabled && styles.disabled,
        style,
      ]}
    >
      {active && <Icon name="checkmark" size={20} color="white" />}
    </View>
  );
}

export function Radiomark({
  size = 24,
  active,
  disabled,
  color = '#298AE5',
  borderColor = '#9B9B9B',
  style,
}) {
  const radio = StyleSheet.create({
    normal: {
      width: size,
      height: size,

      borderRadius: size / 2,
      borderWidth: 2,
      borderColor: borderColor,
    },
    active: {
      borderWidth: 7,
      borderColor: color,
      backgroundColor: 'white',
    },
  });

  return (
    <View
      style={[
        radio.normal,
        active && radio.active,
        disabled && styles.disabled,
        style,
      ]}
    />
  );
}

export function Switch({
  size = 24,
  active,
  disabled,
  color = '#298AE5',
  borderColor = '#9B9B9B',
  style,
}) {
  const switchStyle = StyleSheet.create({
    normal: {
      width: size * 2,
      height: size,

      borderRadius: size / 2,
      borderWidth: 2,
      borderColor: borderColor,

      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
    },
    active: {
      borderWidth: 0,
      backgroundColor: color,
    },
    circle: {
      width: size - 8,
      height: size - 8,
      borderRadius: size / 2,
      backgroundColor: borderColor,
      transform: [{ translateX: -size / 2 }],
    },
    activeCircle: {
      backgroundColor: 'white',
      transform: [{ translateX: size / 2 }],
    },
  });
  return (
    <View
      style={[
        switchStyle.normal,
        active && switchStyle.active,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={[switchStyle.circle, active && switchStyle.activeCircle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    width: '100%',
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: 20,
  },
  title: {
    fontSize: 17,
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Check = {
  Item,
  Group,
};
