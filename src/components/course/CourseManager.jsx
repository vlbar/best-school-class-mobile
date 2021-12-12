import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated, BackHandler, TouchableNativeFeedback, View } from 'react-native';
import Color from '../../constants';
import Icon from 'react-native-vector-icons/Ionicons';

import CourseList from './CourseList';
import useBreadcrumbs from './useBreadcrumbs';
import AddCoursePopup from './AddCoursePopup';
import useIsKeyboardShow from '../../utils/useIsKeyboardShow';

function CourseManager() {
  const [parentCourse, setParentCourse] = useState(undefined);
  const [pushCourse, popCourse, Breadcrumbs] = useBreadcrumbs('Курсы', onCourseSelect);

  const courseListRef = useRef();
  const [isAddCoursePopupShow, setIsAddCoursePopupShow] = useState(false);
  const isKeyboardShow = useIsKeyboardShow();

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, []);

  // travel
  function onCourseSelect(course) {
    if (!course.id) setParentCourse(undefined);
    else setParentCourse(course);
    subcoursesInAnimation();
  }

  function onCoursePress(course) {
    pushCourse(course);
    setParentCourse(course);

    subcoursesOutAnimation();
  }

  // popits
  function addCourse() {
    setIsAddCoursePopupShow(true);
  }

  function editCourse(course) {
    setIsAddCoursePopupShow(true);
  }

  function closeAddCoursePopup() {
    setIsAddCoursePopupShow(false);
  }

  function forceRefresh() {
    courseListRef.current.refresh();
  }

  // bread
  const [jsCringe, setJsCringe] = useState(false);
  useEffect(() => {
    if (jsCringe) {
      setJsCringe(false);
      popCourse();
    }
  }, [jsCringe]);

  function onBackPress() {
    setJsCringe(true);
    return true;
  }

  // animation
  const subcoursesAnim = useRef(new Animated.Value(0)).current;

  const subcoursesOutAnimation = callback => {
    subcoursesAnim.setValue(0);
    Animated.timing(subcoursesAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      callback?.();
      subcoursesAnim.setValue(0);
    });
  };

  const subcoursesInAnimation = callback => {
    subcoursesAnim.setValue(1);
    Animated.timing(subcoursesAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(() => callback?.());
  };

  const transform = {
    transform: [
      {
        translateX: subcoursesAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -50],
        }),
      },
    ],
    opacity: subcoursesAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  };

  return (
    <>
      <Breadcrumbs style={styles.breadcrumbs} />
      <Animated.View style={[styles.listContainer, transform]}>
        <CourseList parentCourse={parentCourse} onCoursePress={onCoursePress} ref={courseListRef} />
      </Animated.View>
      {!isKeyboardShow && <ActionButton onPress={addCourse} />}
      <AddCoursePopup
        show={isAddCoursePopupShow}
        parentCourse={parentCourse}
        onClose={closeAddCoursePopup}
        onSuccess={forceRefresh}
      />
    </>
  );
}

export function ActionButton({ name = 'add-outline', color = Color.primary, iconColor = Color.white, onPress }) {
  return (
    <View style={[styles.actionButtonContainer]}>
      <TouchableNativeFeedback onPress={onPress} style={styles.tocuhableFeedback}>
        <View style={[styles.actionButton]}>
          <Icon name={name} size={24} color={iconColor} />
        </View>
      </TouchableNativeFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  actionButtonContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    backgroundColor: Color.primary,
    borderRadius: 999,
    overflow: 'hidden',
    zIndex: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionButton: {
    flex: 1,
    padding: 16,
  },
});

export default CourseManager;
