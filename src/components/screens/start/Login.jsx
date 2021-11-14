import React, { useContext, useState } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from 'react-native';
import { getI } from '../../../utils/Internationalization';
import Button from '../../common/Button';
import Container from '../../common/Container';
import InputForm from '../../common/InputForm';
import {
  PASSWORD_RECOVERY_SCREEN,
  REGISTER_SCREEN,
  TemporaryLoginContext,
} from '../../navigation/StartNavigation';

import logo from '../../../assets/images/app_logo.png';
import cumwave from '../../../assets/images/cumwave.png';
import FormGroup from '../../common/FormGroup';
import axios from 'axios';
import SecureStorage from 'react-native-secure-storage';

function login(username, password) {
  const cridentials = {
    username,
    password,
  };
  return axios
    .post('v2/auth/tokens/', cridentials, { skipAuthRefresh: true })
    .then(response => {
      return response.data;
    });
}

function Login({ navigation }) {
  const { onLoginSuccess } = useContext(TemporaryLoginContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  function onForgotten() {
    navigation.navigate(PASSWORD_RECOVERY_SCREEN);
  }

  function onRegister() {
    navigation.navigate(REGISTER_SCREEN);
  }

  function onLogin() {
    login(username, password)
      .then(data => {
        SecureStorage.setItem('token', data.token);
        SecureStorage.setItem('refreshToken', data.refreshToken);

        onLoginSuccess();
      })
      .catch(err => {
        setError(err.response.data.message);
      });
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[styles.logoContainer]}>
          <Text style={styles.title}>Best school class</Text>
          <Image source={logo} style={styles.logo} />
          <Image source={cumwave} style={styles.cumwave} />
        </View>
        <Container style={styles.mainContainer}>
          <View>
            <Text style={styles.cumback}>
              {getI('start.comeback')}
            </Text>
            {error && <Text style={styles.error}>{error}</Text>}
            <FormGroup>
              <InputForm
                label={getI('start.username')}
                onChange={setUsername}
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
                <Text>{getI('login.forgot-question', 'Забыли пароль?')}</Text>
                <Text> </Text>
                <Text style={styles.textActionButton}>
                  {getI('login.forgot-button', 'Восстановить пароль')}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View>
            <Button title={getI('login.button', 'Войти')} onPress={onLogin} />
            <TouchableWithoutFeedback onPress={onRegister}>
              <View
                style={[
                  styles.textActionContainer,
                  styles.registerActionContainer,
                ]}
              >
                <Text>{getI('login.register-question', 'Нет аккаунта?')}</Text>
                <Text> </Text>
                <Text style={styles.textActionButton}>
                  {getI('login.register-button', 'Зарегистрироваться')}
                </Text>
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
    backgroundColor: '#E7EDF4',
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
    marginBottom: -100,
  },
  cumwave: {
    width: '100%',
    height: 152,
    resizeMode: 'stretch',
  },
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '700',
    fontSize: 30,
    textTransform: 'uppercase',
    paddingHorizontal: 60,
    textAlign: 'center',
    color: 'black',
  },
  cumback: {
    textAlign: 'center',
    fontSize: 17,
    marginTop: 10,
    marginBottom: 20,
    color: 'black',
  },
  textActionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  textActionButton: {
    color: '#298AE5',
  },
  registerActionContainer: {
    justifyContent: 'center',
    marginVertical: 16,
  },
  error: {
    color: '#87212b',
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#f8d7da',
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
  },
});
