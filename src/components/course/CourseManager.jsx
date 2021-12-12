import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated, BackHandler } from 'react-native';

import CourseList from './CourseList';
import useBreadcrumbs from './useBreadcrumbs';

function CourseManager() {
  const [parentCourse, setParentCourse] = useState(undefined);
  const [pushCourse, popCourse, Breadcrumbs] = useBreadcrumbs('Курсы', onCourseSelect);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, []);

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
        <CourseList parentCourse={parentCourse} onCoursePress={onCoursePress} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
});

export default CourseManager;
