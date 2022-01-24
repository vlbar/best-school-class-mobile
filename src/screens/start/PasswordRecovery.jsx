import React, { useState } from 'react';
import axios from 'axios';
import { Image, SafeAreaView, StyleSheet, View } from 'react-native';

import Button from '../../components/common/Button';
import Text from '../../components/common/Text';
import Container from '../../components/common/Container';
import InputForm from '../../components/common/InputForm';
import cumwave from '../../assets/images/cumwave.png';
import Color from '../../constants';
import ErrorAlert from '../../components/common/ErrorAlert';
import { CONFIRMATION_SCREEN } from './Confirmation';
import { getI } from '../../utils/Internationalization';
import { PASSWORD_RESET_SCREEN } from './PasswordChange';
import LanguageSelectButton from '../../components/auth/LanguageSelectButton';
import { LANGUAGE_SELECT_SCREEN } from './LanguageSelect';
import CumView from '../../components/auth/CumView';

const tokens_url = 'v2/confirmation-tokens';

function send(email) {
  return axios.post(tokens_url, { email }).then(response => response.data);
}

export const PASSWORD_RECOVERY_SCREEN = 'PasswordRecovery';
export default function PasswordRecovery({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function onConfirmation(authentication) {
    navigation.navigate({
      name: PASSWORD_RESET_SCREEN,
      params: {
        authentication,
      },
    });
  }

  function onNext() {
    setError(null);
    setLoading(true);
    send(email)
      .then(() => {
        navigation.navigate({
          name: CONFIRMATION_SCREEN,
          params: {
            email,
            onSuccess: onConfirmation.bind(this),
          },
        });
      })
      .catch(err => {
        if (err.response?.status == 404) setError('password-recovery.account-not-found');
        console.log(err);
      })
      .finally(() => setLoading(false));
  }

  function goToLanguageSelect() {
    navigation.navigate(LANGUAGE_SELECT_SCREEN);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CumView title={getI('password-recovery.title')}>
        <LanguageSelectButton onPress={goToLanguageSelect} />
        <Container style={styles.container}>
          <View>
            <Text style={styles.info}>{getI('password-recovery.info')}</Text>
            <ErrorAlert message={getI(error)}></ErrorAlert>
            <InputForm
              label={getI('password-recovery.email')}
              onChange={setEmail}
              placeholder={getI('password-recovery.email-placeholder')}
              textContentType="emailAddress"
              autoComplete="email"
              keyboardType="email-address"
            />
          </View>
          <Button onPress={onNext} title={getI('password-recovery.continue', 'Продолжить')} disabled={loading} />
        </Container>
      </CumView>
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
    marginBottom: 15,
  },
});
