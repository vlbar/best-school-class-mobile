import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Color from '../../constants';
import getContrastColor from './../../utils/ContrastColor';
import IconButton from '../common/IconButton';
import Text from '../common/Text';

const BACK_SIZE = 40;
const BACK_SIZE_WITH_PADDING = BACK_SIZE + 12;
const HEADER_HEIGHT = 56;
const HEADER_PADDING_RIGHT = 10;
const HEADER_PADDING_LEFT = 0;
const TITLE_MARGIN = 5;

function Header({ canBack, title, backgroundColor = Color.white, headerRight, onBack, children }) {
  const navigation = useNavigation();
  const [canGoBack, setCanGoBack] = useState(navigation.canGoBack() && (navigation?.getState()?.routes?.length > 1 || canBack));

  const onBackHandler = () => {
    const result = onBack?.();
    if (result === undefined || result === true) navigation.goBack();
  };

  let minTitleMarginSize = canGoBack ? BACK_SIZE_WITH_PADDING : 0;
  return (
    <View style={[styles.header, { backgroundColor: backgroundColor ?? Color.white }]}>
      <View style={styles.titleBackView}>
        <View style={[styles.margin, { minWidth: minTitleMarginSize }]}>{headerRight}</View>
        <Text weight="bold" style={[styles.title, { color: getContrastColor(backgroundColor) }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.margin, { minWidth: minTitleMarginSize }]}>{headerRight}</View>
      </View>
      <View style={styles.frontContainer}>
        {canGoBack && (
          <IconButton
            name="chevron-back-outline"
            size={BACK_SIZE}
            color={getContrastColor(backgroundColor)}
            onPress={onBackHandler}
          />
        )}
        {children}
        <View style={styles.headerRight}>{headerRight}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: HEADER_HEIGHT,
    paddingLeft: HEADER_PADDING_LEFT,
    paddingRight: HEADER_PADDING_RIGHT,
  },
  titleBackView: {
    position: 'absolute',
    right: Math.max(HEADER_PADDING_RIGHT, HEADER_PADDING_LEFT),
    left: Math.max(HEADER_PADDING_RIGHT, HEADER_PADDING_LEFT),
    flexDirection: 'row',
  },
  margin: {
    height: 0,
    overflow: 'hidden',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: TITLE_MARGIN,
    marginTop: 15,
  },
  frontContainer: {
    height: '100%',
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerRight: {
    marginLeft: 'auto',
  },
});

export default Header;
