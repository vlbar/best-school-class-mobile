import React from 'react';

import Container from '../../components/common/Container';
import Header from '../../components/navigation/Header';
import { translate } from '../../utils/Internationalization';
import CourseManager from './../../components/course/CourseManager';

export const COURSE_SCREEN = 'course';
function Course({ navigation }) {
  return (
    <>
      <Header title={translate('course.title', 'Курс')} />
      <Container>
        <CourseManager />
      </Container>
    </>
  );
}

export default Course;
