import React, { useState } from 'react';
import { Image, SafeAreaView, StyleSheet, View } from 'react-native';
import { getI } from '../../../utils/Internationalization';
import Button from '../../common/Button';
import Text from '../../common/Text';
import Container from '../../common/Container';
import InputForm from '../../common/InputForm';
import cumwave from '../../../assets/images/cumwave.png';
import Color from '../../../constants';
import {
  CONFIRMATION_SCREEN,
  PASSWORD_RESET_SCREEN,
} from '../../navigation/StartNavigation';
import axios from 'axios';
import ErrorAlert from '../../common/ErrorAlert';

const tokens_url = 'v2/confirmation-tokens';

function send(email) {
  return axios.post(tokens_url, { email }).then(response => response.data);
}

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
        if (err.response?.status == 404)
          setError('password-recovery.account-not-found');
        console.log(err);
      })
      .finally(() => setLoading(false));
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Image source={cumwave} style={styles.cumwave} />
      <Container style={styles.container}>
        <View>
          <Text style={styles.title}>{getI('password-recovery.title')}</Text>
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
        <Button
          onPress={onNext}
          title={getI('password-recovery.continue', 'Продолжить')}
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
