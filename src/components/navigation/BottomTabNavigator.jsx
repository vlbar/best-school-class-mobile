import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { CommonActions } from '@react-navigation/routers';
import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import Color from '../../constants';
import Text from '../common/Text';

// SALEX GUIDELINES!!!! https://material.io/components/bottom-navigation#specs
const BAR_HEIGHT = 56;
const MIN_TAB_WIDTH = 96;
const MAX_TAB_WIDTH = 168;

function BottomTabNavigator({ navigationState, navigationRef, navigatorTabs }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isKeyboardShow, setIsKeyboardShow] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardShow(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardShow(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // только не спрашивайте потом, почему undefined...
  useEffect(() => {
    let currentNavigatorRoute = navigationState?.routes?.[navigationState.routes.length - 1];
    let isFirstScreen = currentNavigatorRoute?.state?.index === 0;
    let currentScreenRoutes = currentNavigatorRoute?.state?.routes?.[currentNavigatorRoute.state.routes.length - 1];
    let isScreenNeedBottomTabs = currentScreenRoutes?.params?.tabBarVisible;

    setIsVisible((isFirstScreen || isScreenNeedBottomTabs) && isScreenNeedBottomTabs !== false);
  }, [navigationState]);

  if (isVisible && !isKeyboardShow)
    return (
      <View style={styles.container}>
        {navigatorTabs.map((tab, index) => {
          return (
            <BottomMenuTab
              key={index}
              name={tab.name}
              title={tab.title}
              iconName={tab.iconName}
              focusedIconName={tab.focusedIconName}
              navigationState={navigationState}
              navigationRef={navigationRef}
            />
          );
        })}
      </View>
    );
  else return <View></View>;
}

function BottomMenuTab({ name, title, iconName, focusedIconName, navigationState, navigationRef }) {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setFocused(navigationState.routes[navigationState.routes.length - 1].name === name);
  }, [navigationState]);

  const onPressHandler = () => {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name }],
      }),
    );
  };

  return (
    <TouchableWithoutFeedback onPress={onPressHandler}>
      <View style={styles.tab}>
        <Icon
          style={[styles.icon, focused && styles.iconFocused]}
          name={focused ? focusedIconName : iconName}
          size={24}
        />
        <Text style={[styles.title, focused && styles.titleFocused]}>{title}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: BAR_HEIGHT,
    width: '100%',
    backgroundColor: Color.white,
    borderTopColor: Color.lightGray,
    borderTopWidth: 1,
  },
  tab: {
    maxWidth: MAX_TAB_WIDTH,
    minWidth: MIN_TAB_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: Color.silver,
  },
  iconFocused: {
    color: Color.primary,
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    color: Color.gray,
  },
  titleFocused: {
    color: Color.primary,
  },
});

export default BottomTabNavigator;
