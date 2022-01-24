import React, { useContext, useState } from 'react';
import axios from 'axios';
import { SafeAreaView, StyleSheet, TouchableWithoutFeedback, View, ScrollView } from 'react-native';

import Button from './../../components/common/Button';
import Color from '../../constants';
import Container from '../../components/common/Container';
import cumwave from '../../assets/images/cumwave.png';
import ErrorAlert from './../../components/common/ErrorAlert';
import FormGroup from './../../components/common/FormGroup';
import InputForm from './../../components/common/InputForm';
import logo from '../../assets/images/app_logo.png';
import SecureStorage from 'react-native-secure-storage';
import Text from '../../components/common/Text';
import { getI } from '../../utils/Internationalization';
import { PASSWORD_RECOVERY_SCREEN } from './PasswordRecovery';
import { REGISTER_SCREEN } from './Register';
import { TemporaryLoginContext } from '../../../App';
import LanguageSelectButton from '../../components/auth/LanguageSelectButton';
import { LANGUAGE_SELECT_SCREEN } from './LanguageSelect';
import FastImage from 'react-native-fast-image';

function login(username, password) {
  const cridentials = {
    username,
    password,
  };
  return axios.post('v2/auth/tokens/', cridentials, { skipAuthRefresh: true }).then(response => {
    return response.data;
  });
}

export const LOGIN_SCREEN = 'Login';
function Login({ navigation }) {
  const { setIsSignedIn } = useContext(TemporaryLoginContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function onForgotten() {
    navigation.navigate(PASSWORD_RECOVERY_SCREEN);
  }

  function onRegister() {
    navigation.navigate(REGISTER_SCREEN);
  }

  function onLogin() {
    setError(null);
    setLoading(true);
    login(username, password)
      .then(data => {
        Promise.all([
          SecureStorage.setItem('token', data.token),
          SecureStorage.setItem('refreshToken', data.refreshToken),
        ]).then(() => setIsSignedIn(true));
      })
      .catch(err => {
        if (err.response?.status == 401) setError('start.bad-credentials');
        console.log(err);
      })
      .finally(() => setLoading(false));
  }

  function goToLanguageSelect() {
    navigation.navigate(LANGUAGE_SELECT_SCREEN);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: Color.white }}>
        <LanguageSelectButton onPress={goToLanguageSelect} />
        <View style={[styles.logoContainer]}>
          <Text style={styles.title}>Best school class</Text>
          <FastImage source={logo} style={styles.logo} />
        </View>
        <FastImage source={cumwave} style={styles.cumwave} />
        <Container style={styles.mainContainer}>
          <View>
            <Text style={styles.cumback}>{getI('start.comeback')}</Text>
            <ErrorAlert message={getI(error)}></ErrorAlert>
            <FormGroup>
              <InputForm
                label={getI('start.username')}
                onChange={setUsername}
                textContentType="emailAddress"
                autoComplete="email"
                keyboardType="email-address"
              />
              <InputForm
                label={getI('start.password')}
                style={{ marginBottom: 6 }}
                secureTextEntry={true}
                onChange={setPassword}
              />
            </FormGroup>
            <TouchableWithoutFeedback onPress={onForgotten}>
              <View style={styles.textActionContainer}>
                <Text style={styles.littleText}>{getI('start.forgot-question')}</Text>
                <Text> </Text>
                <Text style={[styles.littleText, styles.textActionButton]}>{getI('start.forgot-button')}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View>
            <Button title={getI('start.signin', 'Войти')} onPress={onLogin} disabled={loading} />
            <TouchableWithoutFeedback onPress={onRegister}>
              <View style={[styles.textActionContainer, styles.registerActionContainer]}>
                <Text style={styles.littleText}>{getI('start.register-question')}</Text>
                <Text> </Text>
                <Text style={[styles.littleText, styles.textActionButton]}>{getI('start.register-button')}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Login;

const styles = StyleSheet.create({
  logoContainer: {
    flex: 1,
    backgroundColor: Color.background,
    flexShrink: 0.6,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
    flexGrow: 1.4,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 50
  },
  cumwave: {
    overflow: 'hidden',
    width: '100%',
    height: 152,
    marginTop: -152,
    resizeMode: 'contain',
  },
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 'bold',
    marginTop: 40,
    fontSize: 30,
    textTransform: 'uppercase',
    paddingHorizontal: 60,
    textAlign: 'center',
    color: Color.black,
  },
  cumback: {
    textAlign: 'center',
    fontSize: 17,
    marginTop: 20,
    marginBottom: 20,
    color: Color.black,
  },
  textActionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  littleText: {
    fontSize: 14,
    color: Color.gray,
  },
  textActionButton: {
    color: Color.primary,
  },
  registerActionContainer: {
    justifyContent: 'center',
    marginVertical: 16,
  },
});
