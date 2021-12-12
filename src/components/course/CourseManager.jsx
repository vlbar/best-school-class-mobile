import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated, BackHandler, TouchableNativeFeedback, View, Alert, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import AddCoursePopup from './AddCoursePopup';
import AddTaskPopup from '../tasks/AddTaskPopup';
import Color from '../../constants';
import CourseList from './CourseList';
import TaskList from '../tasks/TaskList';
import IconButton from '../common/IconButton';
import Text from '../common/Text';
import translate from '../../utils/Internationalization';
import useBreadcrumbs from './useBreadcrumbs';
import useIsKeyboardShow from '../../utils/useIsKeyboardShow';

const SUB_COURSES_TAB = 'subcoursesTab';
const TASKS_TAB = 'tasksTab';

function CourseManager() {
  const [parentCourse, setParentCourse] = useState(undefined);
  const [pushCourse, popCourse, Breadcrumbs] = useBreadcrumbs(translate('course.root'), onCourseSelect);

  const courseListRef = useRef();
  const [isAddCoursePopupShow, setIsAddCoursePopupShow] = useState(false);
  const isKeyboardShow = useIsKeyboardShow();

  const [isAddTaskPopupShow, setIsAddTaskPopupShow] = useState(false);

  const [currentTab, setCurrentTab] = useState(SUB_COURSES_TAB);

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

  function addTask() {
    setIsAddTaskPopupShow(true);
  }

  function editTask(task) {
    console.log(task);
    setIsAddTaskPopupShow(false);
  }

  function closeAddTask() {
    setIsAddTaskPopupShow(false);
  }

  //course actions
  async function deleteSelectedCourses() {
    const sadCourses = courseListRef.current.getSelected();
    courseListRef.current.setIsFetching(true);
    for await (const course of sadCourses) {
      await course.link().delete();
    }

    forceRefresh();
  }

  const title = translate('common.confirmation');
  const confirmation = translate('course.delete-course-confirmation');
  const ok = translate('common.ok');
  const cancel = translate('common.cancel');
  function showDeleteCoursesAlert() {
    Alert.alert(title, confirmation, [
      {
        text: cancel,
        style: 'cancel',
      },
      { text: ok, onPress: () => deleteSelectedCourses() },
    ]);
  }

  const courseActions = (
    <IconButton name="trash-outline" size={24} style={styles.actionIcon} onPress={showDeleteCoursesAlert} />
  );

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

  // render
  const horizontalMenu = (
    <OldSchoolHorizontalMenu style={{ marginBottom: 10 }}>
      <OldSchoolHorizontalMenu.Item
        title={translate('course.sub-courses')}
        value={SUB_COURSES_TAB}
        selectedValue={currentTab}
        onPress={setCurrentTab}
      />
      <OldSchoolHorizontalMenu.Item
        title={translate('tasks.title')}
        value={TASKS_TAB}
        selectedValue={currentTab}
        onPress={setCurrentTab}
      />
    </OldSchoolHorizontalMenu>
  );

  const isCoursesTab = currentTab === SUB_COURSES_TAB;
  return (
    <>
      <Breadcrumbs style={styles.breadcrumbs} />
      <View style={[styles.listContainer, !isCoursesTab && styles.hidden]}>
        <Animated.View style={[styles.listContainer, transform]}>
          <CourseList
            parentCourse={parentCourse}
            onCoursePress={onCoursePress}
            actionMenuContent={courseActions}
            headerContent={horizontalMenu}
            ref={courseListRef}
          />
        </Animated.View>
        {!isKeyboardShow && <ActionButton onPress={addCourse} />}
        <AddCoursePopup
          show={isAddCoursePopupShow}
          parentCourse={parentCourse}
          onClose={closeAddCoursePopup}
          onSuccess={forceRefresh}
        />
      </View>
      <View style={[styles.listContainer, isCoursesTab && styles.hidden]}>
        <TaskList parentCourse={parentCourse} headerContent={horizontalMenu} autoFetch={!isCoursesTab} />
        {!isKeyboardShow && parentCourse && <ActionButton onPress={addTask} />}
        <AddTaskPopup
          show={isAddTaskPopupShow}
          parentCourse={parentCourse}
          onClose={closeAddTask}
          onSuccess={editTask}
        />
      </View>
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

function OldSchoolHorizontalMenuContainer({ children, style }) {
  return <View style={[horizontalMenuStyles.container, style]}>{children}</View>;
}

function OldSchoolHorizontalMenuItem({ selectedValue, value, title, onPress, style }) {
  const onPressHandler = () => {
    onPress?.(value);
  };

  const isActive = selectedValue === value;
  return (
    <Pressable onPress={onPressHandler} style={[horizontalMenuStyles.item]}>
      <Text style={[horizontalMenuStyles.title, isActive && horizontalMenuStyles.active, style]}>{title}</Text>
    </Pressable>
  );
}

var OldSchoolHorizontalMenu = OldSchoolHorizontalMenuContainer;
OldSchoolHorizontalMenu.Item = OldSchoolHorizontalMenuItem;

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  hidden: {
    height: 0,
    overflow: 'hidden',
    position: 'absolute',
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
  actionIcon: {
    marginLeft: 10,
  },
});

const horizontalMenuStyles = StyleSheet.create({
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

export default CourseManager;
