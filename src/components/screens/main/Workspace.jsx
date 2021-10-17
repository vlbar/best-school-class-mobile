import React from 'react';
import { Button, Text, View } from 'react-native';
import { COURSES_SCREEN } from '../../navigation/MainNavigation';

function Workspace({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Workspace...</Text>
      <Button
        title="Courses"
        onPress={() => navigation.navigate(COURSES_SCREEN)}
      />
    </View>
  );
}

export default Workspace;
