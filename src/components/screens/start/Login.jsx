import React, { useContext } from 'react';
import { Button, Text, View } from 'react-native';
import {
  REGISTER_SCREEN,
  TemporaryLoginContext,
} from '../../navigation/StartNavigation';

function Login({ navigation }) {
  const { onLoginSuccess } = useContext(TemporaryLoginContext);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Login...</Text>
      <Button
        title="Register"
        onPress={() => navigation.navigate(REGISTER_SCREEN)}
      />
      <Button title="Login" onPress={() => onLoginSuccess()} />
    </View>
  );
}

export default Login;
