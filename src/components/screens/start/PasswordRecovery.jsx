import React from 'react';
import { StyleSheet, Text } from 'react-native';
import getI from '../../../utils/Internationalization';
import Container from '../../common/Container';
import InputForm from '../../common/InputForm';

export default function PasswordRecovery({ navigation }) {
  return (
    <Container>
      <Text>{getI('password-recovery.title', 'Восстановление пароля')}</Text>
      <Text>
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
    </Container>
  );
}

const styles = StyleSheet.create({});
