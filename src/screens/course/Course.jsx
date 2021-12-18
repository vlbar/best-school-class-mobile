import React from 'react';

import Header from '../../components/navigation/Header';
import { translate } from '../../utils/Internationalization';
import CourseManager from './../../components/course/CourseManager';
import { View } from 'react-native';

export const COURSE_SCREEN = 'course';
function Course({ navigation }) {
  return (
    <>
      <Header title={translate('course.title', 'Курс')} />
      <View style={{ flex: 1, marginHorizontal: 10 }}>
        <CourseManager />
      </View>
    </>
  );
}

export default Course;
