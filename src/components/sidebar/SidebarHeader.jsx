import React, { useEffect, useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { StyleSheet, View, TouchableWithoutFeedback, Animated } from 'react-native';

import Avatar from '../user/Avatar';
import Color from '../../constants';
import IconButton from '../common/IconButton';
import Text from '../common/Text';
import UserName from '../user/UserName';
import Resource from '../../utils/Hateoas/Resource';

const OPEN_STATE_LIST_HEIGHT = 135;

const types = {
  TEACHER: 'teacher',
  STUDENT: 'student',
  ASSISTANT: 'assistant',
};
//const userEmail = 'kenekochan@mail.ru';
//const user = { firstName: 'Олег', secondName: 'Незабудкин', middleName: 'Прокопьевич' };

const USER_URL = 'v1/users/me';

function SidebarHeader({ navigation }) {
  const isStaetListShow = useRef(false);
  const stateListHeight = useRef(new Animated.Value(0)).current;
  const [user, setUser] = useState(null);

  useEffect(() => {
    Resource.basedOnHref(USER_URL).link().fetch().then(setUser);
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

  const onStateSelect = stateKey => {
    // ...
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
              <Text style={styles.currentStateText}>{'Преподаватель'}</Text>
              <Animated.View style={stateArrowRotateAnim}>
                <Icon name="chevron-down-outline" size={20} color={Color.silver} />
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
      <Animated.View style={[styles.stateContainer, stateListHeightAnim]}>
        {Object.keys(types).map(key => {
          return <StateButton key={key} value={key} isActive={false} text={types[key]} onPress={onStateSelect} />;
        })}
        <View style={styles.horizonLine} />
      </Animated.View>
    </>
  );
}

function StateButton({ isActive, text, value, onPress, style }) {
  return (
    <TouchableWithoutFeedback onPress={() => !isActive && onPress(value)}>
      <View style={[styles.state, isActive && styles.activeState, style]}>
        <Text style={[styles.stateText, isActive && styles.activeStateText]}>{text}</Text>
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
  },
  currentStateText: {
    color: Color.silver,
    fontSize: 14,
    marginRight: 5,
  },
  stateContainer: {
    overflow: 'hidden',
  },
  state: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  stateText: {},
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
