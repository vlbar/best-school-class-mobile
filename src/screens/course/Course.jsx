import React, { useContext } from 'react';
import { View } from 'react-native';

import CourseManager from './../../components/course/CourseManager';
import Header from '../../components/navigation/Header';
import HomeworkBuilderPanel from './../../components/course/homework/HomeworkBuilderPanel';
import useOutsideHomeworkBuilder from '../../components/course/homework/OutsideHomeworkBuilder';
import { CourseNavigationContext } from '../../components/course/CourseNavigationContext';
import { translate } from '../../utils/Internationalization';

export const COURSE_SCREEN = 'course';
function Course({ navigation }) {
  const { contextHomework, setContextHomework } = useContext(CourseNavigationContext);
  const { pushTasksToHomework } = useOutsideHomeworkBuilder();

  const pushTasks = tasks => {
    pushTasksToHomework(tasks);
  };

  return (
    <>
      <Header title={translate('course.title', 'Курс')} />
      <View style={{ flex: 1 }}>
        <HomeworkBuilderPanel homework={contextHomework} onCancel={() => setContextHomework(undefined)} />
        <CourseManager onPushSelectedTasks={pushTasks} />
      </View>
    </>
  );
}

export default Course;
