import React from 'react';

import Container from '../../components/common/Container';
import Header from '../../components/navigation/Header';
import Text from '../../components/common/Text';
import { Button } from 'react-native';
import { TASKS_SCREEN } from './Tasks';
import { translate } from '../../utils/Internationalization';

export const COURSE_SCREEN = 'course';
function Course({ navigation }) {
  return (
    <>
      <Header title={translate('screen.course.title')} />
      <Container>
        <Text>Course...</Text>
        <Button title="Courses" onPress={() => navigation.navigate(TASKS_SCREEN)} />
      </Container>
    </>
  );
}

export default Course;
