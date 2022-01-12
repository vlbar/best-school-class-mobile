import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated, BackHandler, TouchableNativeFeedback, View, Alert, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import AddCoursePopup from './AddCoursePopup';
import AddTaskPopup from '../tasks/AddTaskPopup';
import Color from '../../constants';
import CourseList from './CourseList';
import IconButton from '../common/IconButton';
import TaskList from '../tasks/TaskList';
import Text from '../common/Text';
import translate from '../../utils/Internationalization';
import useBreadcrumbs from './useBreadcrumbs';
import useIsKeyboardShow from '../../utils/useIsKeyboardShow';
import { CourseNavigationContext, useOnBackCatcher } from './CourseNavigationContext';
import { TASK_SCREEN } from '../../screens/course/TaskQuestions';

const SUB_COURSES_TAB = 'subcoursesTab';
const TASKS_TAB = 'tasksTab';

function CourseManager({ onPushSelectedTasks }) {
  const navigation = useNavigation();
  const [parentCourse, setParentCourse] = useState(null);
  const [pushCourse, popCourse, Breadcrumbs] = useBreadcrumbs(translate('course.root'), onCourseSelect);

  const courseListRef = useRef();
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courseToEdit, setCourseToEdit] = useState(undefined);
  const [isModifyCoursePopupShow, setIsModifyCoursePopupShow] = useState(false);
  const isKeyboardShow = useIsKeyboardShow();

  const [isAddTaskPopupShow, setIsAddTaskPopupShow] = useState(false);

  const [currentTab, setCurrentTab] = useState(SUB_COURSES_TAB);
  const waitBackFromEdit = useOnBackCatcher(onBackFromEdit);
  const { contextTask } = useContext(CourseNavigationContext);
  const taskListRef = useRef();

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, []);

  // travel
  function onCourseSelect(course) {
    if (!course.id) setParentCourse(null);
    else setParentCourse(course);
    setCurrentTab(SUB_COURSES_TAB);

    subcoursesInAnimation();
  }

  function onCoursePress(course) {
    pushCourse(course);
    setParentCourse(course);
    if (course.isEmpty) setCurrentTab(TASKS_TAB);

    subcoursesOutAnimation();
  }

  function onTaskPress(task) {
    waitBackFromEdit();
    navigation.navigate(TASK_SCREEN, { id: task.id });
  }

  function onBackFromEdit() {
    if (contextTask) taskListRef.current.updateTask(contextTask);
  }

  // popits - courses
  function addCourse() {
    setCourseToEdit(undefined);
    setIsModifyCoursePopupShow(true);
  }

  function editCourse(course) {
    setCourseToEdit(course);
    setIsModifyCoursePopupShow(true);
  }

  function closeAddCoursePopup() {
    setIsModifyCoursePopupShow(false);
  }

  function forceRefresh() {
    courseListRef.current.refresh();
  }

  // popits - tasks
  function addTask() {
    setIsAddTaskPopupShow(true);
  }

  function editTask(task) {
    setIsAddTaskPopupShow(false);
    waitBackFromEdit();
    navigation.navigate(TASK_SCREEN, { id: task.id });
  }

  function closeAddTask() {
    setIsAddTaskPopupShow(false);
  }

  //course actions
  async function deleteSelectedCourses() {
    courseListRef.current.setIsFetching(true);
    for await (const course of selectedCourses) {
      await course.link().delete();
    }

    forceRefresh();
  }

  function onCoursesSelectHandler(course, courses) {
    setSelectedCourses(courses);
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
    <>
      {selectedCourses?.length === 1 && (
        <IconButton
          name="create-outline"
          size={24}
          style={styles.actionIcon}
          onPress={() => editCourse(selectedCourses[0])}
        />
      )}
      <IconButton name="trash-outline" size={24} style={styles.actionIcon} onPress={showDeleteCoursesAlert} />
    </>
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
            onCourseSelect={onCoursesSelectHandler}
            onPressEmptyMessage={addCourse}
            ref={courseListRef}
          />
        </Animated.View>
        {!isKeyboardShow && <ActionButton onPress={addCourse} />}
        <AddCoursePopup
          show={isModifyCoursePopupShow}
          parentCourse={parentCourse}
          courseToEdit={courseToEdit}
          onClose={closeAddCoursePopup}
          onSuccess={forceRefresh}
        />
      </View>
      <View style={[styles.listContainer, isCoursesTab && styles.hidden]}>
        <TaskList
          parentCourse={parentCourse}
          additionalHeaderContent={horizontalMenu}
          canFetch={!isCoursesTab}
          canSelect
          onTaskPress={onTaskPress}
          onPushSelected={onPushSelectedTasks}
          ref={taskListRef}
        />
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
  breadcrumbs: {
    marginHorizontal: 20,
  },
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
