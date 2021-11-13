import React from 'react';
import { Button } from 'react-native';

import Container from '../../components/common/Container';
import Text from '../../components/common/Text';
import { navigatorNames } from '../../navigation/NavigationConstants';

export const WORKSPACE_SCREEN = 'workspace';
function Workspace({ navigation }) {
  return (
    <Container>
      <Text>Workspace...</Text>
      <Button
        title="Courses"
        onPress={() =>
          navigation.navigate(navigatorNames.course)
        }
      />
    </Container>
  );
}

export default Workspace;
