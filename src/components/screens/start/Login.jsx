import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import getI from '../../../utils/Internationalization';
import Button from '../../common/Button';
import Container from '../../common/Container';
import InputForm from '../../common/InputForm';
import {
  PASSWORD_RECOVERY_SCREEN,
  REGISTER_SCREEN,
  TemporaryLoginContext,
} from '../../navigation/StartNavigation';

function Login({ navigation }) {
  const { onLoginSuccess } = useContext(TemporaryLoginContext);

  function onForgotten() {
    navigation.navigate(PASSWORD_RECOVERY_SCREEN);
  }

  function onRegister() {
    navigation.navigate(REGISTER_SCREEN);
  }

  return (
    <Container style={styles.container}>
      <Text style={styles.title}>Best school class</Text>
      <View style={styles.container}>
        <View>
          <Text style={styles.cumback}>
            {getI('login.comeback', 'С возвращением!')}
          </Text>
          <InputForm
            label={getI('login.username', 'Имя пользователя')}
            placeholder={getI(
              'login.username-placeholder',
              'Введите имя пользователя...',
            )}
          />
          <InputForm
            label={getI('login.password', 'Пароль')}
            placeholder={getI(
              'login.password-placeholder',
              'Введите пароль...',
            )}
            style={{ marginBottom: 6 }}
          />
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
          <Button
            title={getI('login.button', 'Войти')}
            onPress={() => onLoginSuccess()}
          />
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
      </View>
    </Container>
  );
}

export default Login;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '700',
    fontSize: 30,
    textTransform: 'uppercase',
    paddingHorizontal: 40,
    textAlign: 'center',
  },
  cumback: {
    textAlign: 'center',
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
});
