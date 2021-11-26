import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SecureStorage from 'react-native-secure-storage';
import { Image, SafeAreaView, StyleSheet, View } from 'react-native';

import Button from '../../components/common/Button';
import Color from '../../constants';
import Container from '../../components/common/Container';
import cumwave from '../../assets/images/cumwave.png';
import FormGroup from '../../components/common/FormGroup';
import InputForm from '../../components/common/InputForm';
import Text from '../../components/common/Text';
import { getI } from '../../utils/Internationalization';
import { LOGIN_SCREEN } from './Login';

const change_url = 'v2/accounts/my/password';

function changePassword(password) {
  return axios.put(change_url, { password });
}

export const PASSWORD_RESET_SCREEN = 'PasswordChange';
export default function PasswordChange({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  useEffect(() => {
    Promise.all([
      SecureStorage.setItem('token', route.params.authentication.token),
      SecureStorage.setItem(
        'refreshToken',
        route.params.authentication.refreshToken,
      ),
    ]);
  }, []);

  function onReset() {
    setLoading(true);
    changePassword(password)
      .then(() => {
        navigation.navigate(LOGIN_SCREEN);
      })
      .finally(() => setLoading(false));
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Image source={cumwave} style={styles.cumwave} />
      <Container style={styles.container}>
        <View>
          <Text style={styles.title}>{getI('password-change.title')}</Text>
          <Text style={styles.info}>{getI('password-change.info')}</Text>
          <FormGroup>
            <InputForm
              label={getI('password-change.password')}
              onChange={setPassword}
              secureTextEntry={true}
            />
            <InputForm
              label={getI('password-change.password-confirm')}
              onChange={setPasswordConfirm}
              placeholder={getI('password-change.password-confirm-placeholder')}
              secureTextEntry={true}
            />
          </FormGroup>
        </View>
        <Button
          onPress={onReset}
          title={getI('password-change.restore')}
          disabled={loading}
        />
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  title: {
    fontSize: 17,
    textAlign: 'center',
    color: 'black',
  },
  info: {
    fontSize: 17,
    marginVertical: 15,
  },
  cumwave: {
    width: '100%',
    height: 152,
    marginTop: -100,
    resizeMode: 'contain',
    backgroundColor: Color.background,
  },
});
