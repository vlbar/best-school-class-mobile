import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Color from '../../constants';
import { translate } from '../../utils/Internationalization';
import IconButton from './IconButton';

function SearchBar({
  placeholder = translate('common.search'),
  delay = 1200,
  emptyAfterValue,
  onChange,
  onBlur,
  onSearch,
  onEmpty,
  onDelayStart,
  style,
  children,
  ...inputProps
}) {
  const [value, setValue] = useState('');
  const [isEmpty, setIsEmpty] = useState(true);

  const lastSubmitedValue = useRef(value);
  const notSubmitAfterValue = useRef(undefined);
  const delayTimer = useRef(undefined);

  useEffect(() => {
    notSubmitAfterValue.current = emptyAfterValue;
  }, [emptyAfterValue]);

  const forceSubmit = newValue => {
    clearTimeout(delayTimer.current);
    onSearch?.(newValue);
  };

  const onChangeHandler = newValue => {
    setValue(newValue);
    onChange?.(newValue.trim());

    const isValueEmpty = newValue.trim().length === 0;
    setIsEmpty(isValueEmpty);

    if (isValueEmpty) {
      if (onEmpty) onEmpty();
      else onSearch('');
      lastSubmitedValue.current = newValue;
      clearTimeout(delayTimer.current);
      return;
    }

    if (lastSubmitedValue.current !== newValue) {
      if (!newValue.includes(notSubmitAfterValue.current)) {
        notSubmitAfterValue.current = undefined;
        lastSubmitedValue.current = newValue;
        onDelayStart?.(newValue);

        clearTimeout(delayTimer.current);
        delayTimer.current = setTimeout(() => {
          forceSubmit(newValue);
        }, delay);
      }
    }
  };

  const onClearHandler = () => {
    onChangeHandler('');
  };

  return (
    <View style={[styles.bar, style]}>
      <View style={styles.search}>
        <Icon name="search-outline" size={24} />
        <TextInput
          value={value}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Color.lightGray}
          returnKeyType="search"
          onChangeText={onChangeHandler}
          onBlur={onBlur}
          onSubmitEditing={e => forceSubmit(e.nativeEvent.text.trim())}
          underlineColorAndroid="transparent"
          {...inputProps}
        />
        {!isEmpty && <IconButton name="close" size={18} style={styles.close} onPress={onClearHandler} />}
      </View>
      {children}
    </View>
  );
}

function SearchBarIconButton({ name, onPress }) {
  return (
    <View style={styles.button}>
      <IconButton name={name} onPress={onPress} size={24} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 10,
  },
  search: {
    flex: 1,
    backgroundColor: Color.ultraLightPrimary,
    borderRadius: 6,
    flexDirection: 'row',
    paddingStart: 16,

    alignItems: 'center',
    fontFamily: 'Inter-Regular',
  },
  input: {
    fontSize: 17,
    marginLeft: 10,
    flex: 1,
  },
  close: {
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 8,
  },
  button: {
    backgroundColor: Color.ultraLightPrimary,
    borderRadius: 6,
    padding: 6,
    marginLeft: 10,
  },
});

SearchBar.IconButton = SearchBarIconButton;
export default SearchBar;
