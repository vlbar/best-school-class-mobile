import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { getI } from '../../../utils/Internationalization';
import Button from '../../common/Button';
import Container from '../../common/Container';
import InputForm from '../../common/InputForm';
import cumwave from '../../../assets/images/cumwave.png';
import Color from '../../../constants';

export default function PasswordRecovery({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Image source={cumwave} style={styles.cumwave} />
      <Container style={styles.container}>
        <View>
          <Text style={styles.title}>
            {getI('password-recovery.title', 'Восстановление пароля')}
          </Text>
          <Text style={styles.info}>
            {getI(
              'password-recovery.info',
              'Пожалуйста, введите свое имя пользователя или почту связанные с аккаунтом, и мы отправим вам ссылку для сброса пароля.',
            )}
          </Text>
          <InputForm
            label={getI('password-recovery.email', 'Электронная почта')}
            placeholder={getI(
              'password-recovery.email-placeholder',
              'Введите электронную почту...',
            )}
          />
        </View>
        <Button title={getI('password-recovery.button', 'Продолжить')} />
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
