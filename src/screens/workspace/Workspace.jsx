import React from 'react';
import { Button } from 'react-native';

import Container from '../../components/common/Container';
import Header from '../../components/navigation/Header';
import IconButton from '../../components/common/IconButton';
import Text from '../../components/common/Text';
import { navigatorNames } from '../../navigation/NavigationConstants';
import { translate } from '../../utils/Internationalization';
import User from '../../components/user/User';

const user = { firstName: 'Олег', secondName: 'Незабудкин', middleName: 'Прокопьевич', email: 'kek@kek.ru' }

export const WORKSPACE_SCREEN = 'workspace';
function Workspace({ navigation }) {
  return (
    <>
      <Header title={translate('workspace.title')} headerRight={<IconButton name="add-outline" />} />
      <Container>
        <Text>Workspace...</Text>
        <User user={user} iconPlacement='left' showCurrent={true} short style={{marginVertical: 10}} ><Text>Keks</Text></User>
        <Button title="Courses" onPress={() => navigation.navigate(navigatorNames.course)} />
      </Container>
    </>
  );
}

export default Workspace;
