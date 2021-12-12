import React, { useEffect, useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { StyleSheet, View, TouchableWithoutFeedback, Animated } from 'react-native';

import Avatar from '../user/Avatar';
import Color from '../../constants';
import IconButton from '../common/IconButton';
import Text from '../common/Text';
import UserName from '../user/UserName';
import Resource from '../../utils/Hateoas/Resource';
import { useContext } from 'react';
import { ProfileContext } from '../../navigation/NavigationConstants';
import { types } from '../state/State';
import { getI } from '../../utils/Internationalization';

const OPEN_STATE_LIST_HEIGHT = 135;

const USER_URL = 'v1/users/me';

function SidebarHeader({ navigation }) {
  const isStaetListShow = useRef(false);
  const stateListHeight = useRef(new Animated.Value(0)).current;
  const { user, setUser, state, setState } = useContext(ProfileContext);

  useEffect(() => {
    if (!user) Resource.basedOnHref(USER_URL).link().fetch().then(setUser);
  }, []);

  const openStateList = () => {
    Animated.timing(stateListHeight, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const closeStateList = () => {
    Animated.timing(stateListHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const onToggleStateList = () => {
    isStaetListShow.current = !isStaetListShow.current;
    if (isStaetListShow.current) openStateList();
    else closeStateList();
  };

  const onStateSelect = state => {
    setState(state);
    navigation.closeDrawer();
    isStaetListShow.current = false;
    closeStateList();
  };

  const stateListHeightAnim = {
    height: stateListHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, OPEN_STATE_LIST_HEIGHT],
    }),
  };

  const stateArrowRotateAnim = {
    transform: [
      {
        rotate: stateListHeight.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.container}>
          <View style={styles.upPanel}>
            {user && <Avatar email={user.email} size={72} />}
            <IconButton
              name="chevron-back-outline"
              size={32}
              color={Color.darkGray}
              onPress={() => navigation.closeDrawer()}
            />
          </View>
          {user && <UserName user={user} short textWeight="bold" style={styles.username} textSize={22} />}
          <TouchableWithoutFeedback onPress={onToggleStateList}>
            <View style={styles.statePicker}>
              <FontAwesome5 size={15} name={state.icon} />
              <Text style={styles.currentStateText}>{getI(state.key)}</Text>
              <Animated.View style={stateArrowRotateAnim}>
                <Icon name="chevron-down-outline" size={20} color={Color.silver} />
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
      <Animated.View style={[styles.stateContainer, stateListHeightAnim]}>
        {Object.values(types).map(type => {
          return <StateButton key={type.name} state={type} isActive={state === type} onPress={onStateSelect} />;
        })}
        <View style={styles.horizonLine} />
      </Animated.View>
    </>
  );
}

function StateButton({ isActive, state, onPress, style }) {
  return (
    <TouchableWithoutFeedback onPress={() => !isActive && onPress(state)}>
      <View style={[styles.state, isActive && styles.activeState, style]}>
        <FontAwesome5 size={18} color={isActive ? Color.white : Color.gray} name={state.icon} />
        <Text style={[styles.stateText, isActive && styles.activeStateText]}>{getI(state.key)}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  header: {
    backgroundColor: Color.ultraLightPrimary,
    borderBottomRightRadius: 30,
  },
  upPanel: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  username: {
    marginTop: 10,
  },
  statePicker: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  currentStateText: {
    color: Color.silver,
    fontSize: 14,
    marginRight: 5,
    marginLeft: 10,
  },
  stateContainer: {
    overflow: 'hidden',
  },
  state: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stateText: {
    marginLeft: 10,
  },
  activeState: {
    backgroundColor: Color.primary,
  },
  activeStateText: {
    color: Color.white,
  },
  horizonLine: {
    backgroundColor: Color.ultraLightPrimary,
    height: 1,
  },
});

export default SidebarHeader;
