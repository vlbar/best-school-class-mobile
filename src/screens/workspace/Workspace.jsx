import React from 'react';
import { Button } from 'react-native';

import Container from '../../components/common/Container';
import Header from '../../components/navigation/Header';
import IconButton from '../../components/common/IconButton';
import Text from '../../components/common/Text';
import { navigatorNames } from '../../navigation/NavigationConstants';
import { translate } from '../../utils/Internationalization';

export const WORKSPACE_SCREEN = 'workspace';
function Workspace({ navigation }) {
  return (
    <>
      <Header title={translate('screen.workspace.title')} headerRight={<IconButton name="add-outline" />} />
      <Container>
        <Text>Workspace...</Text>
        <Button title="Courses" onPress={() => navigation.navigate(navigatorNames.course)} />
      </Container>
    </>
  );
}

export default Workspace;
