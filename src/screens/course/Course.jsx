import React from 'react';

import Container from '../../components/common/Container';
import Text from '../../components/common/Text';
import { Button } from 'react-native';
import { TASKS_SCREEN } from './Tasks';

export const COURSE_SCREEN = 'course';
function Course({ navigation }) {
  return (
    <Container>
      <Text>Course...</Text>
      <Button
        title="Courses"
        onPress={() =>
          navigation.navigate(TASKS_SCREEN)
        }
      />
    </Container>
  );
}

export default Course;
