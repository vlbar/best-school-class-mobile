import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { Image, SafeAreaView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import Button from '../../components/common/Button';
import Color from '../../constants';
import Container from '../../components/common/Container';
import cumwave from '../../assets/images/cumwave.png'
import ErrorAlert from '../../components/common/ErrorAlert';
import Text from '../../components/common/Text';
import { getI, useTranslation } from '../../utils/Internationalization';

const tokens_url = 'v2/confirmation-tokens';
const authorize_url = 'v2/auth/tokens?confirmationToken';

function send(email) {
  return axios.post(tokens_url, { email }).then(response => response.data);
}

function authorize(email, code) {
  return axios
    .post(
      authorize_url,
      { email, code },
      {
        skipAuthRefresh: true,
      },
    )
    .then(response => response.data);
}

const CELL_COUNT = 6;
const RESEND_TIMEOUT = 120;

export const CONFIRMATION_SCREEN = 'Confirmation';
export default function Confirmation({ route }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const { translate, options } = useTranslation();
  const ref = useBlurOnFulfill({ value: code, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: code,
    setValue: setCode,
  });
  const [resendTime, setResendTime] = useState(null);
  const sendTime = useRef(new Date());
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (
        sendTime.current.getTime() +
          RESEND_TIMEOUT * 1000 -
          new Date().getTime() <
        0
      )
        setResendTime(null);
      else
        setResendTime(
          moment(sendTime.current)
            .add(RESEND_TIMEOUT, 'second')
            .subtract(new Date())
            .format('mm:ss'),
        );
    }, 500);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  function onResend() {
    setLoading(true);
    send(route.params.email)
      .then(() => {
        sendTime.current = new Date();
      })
      .catch(err => {
        if (err.response?.status == 404)
          setError('confirmation.account-not-found');
        console(err);
      })
      .finally(() => setLoading(false));
  }

  function onNext() {
    setLoading(true);
    authorize(route.params.email, code)
      .then(route.params.onSuccess)
      .catch(err => {
        if (err.response?.status == 401) setError('confirmation.wrong-code');
        else if (err.response?.status == 404)
          setError('confirmation.not-found');
        console.log(err);
      })
      .finally(() => setLoading(false));
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Image source={cumwave} style={styles.cumwave} />
      <Container style={styles.container}>
        <View>
          <Text style={styles.title}>{getI('confirmation.title')}</Text>
          <Text style={styles.info}>
            {translate('confirmation.info', { email: route.params.email })}
          </Text>

          <ErrorAlert message={getI(error)}></ErrorAlert>

          <CodeField
            ref={ref}
            {...props}
            value={code}
            onChangeText={setCode}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFiledRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            onBlur={onNext}
            renderCell={({ index, symbol, isFocused }) => {
              return (
                <View
                  key={index}
                  style={[styles.cellRoot, isFocused && styles.focusCell]}
                  onLayout={getCellOnLayoutHandler(index)}
                >
                  <Text style={styles.cellText}>
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </Text>
                </View>
              );
            }}
          />
          <TouchableWithoutFeedback
            onPress={onResend}
            disabled={resendTime > 0}
          >
            <View>
              <Text style={styles.resend}>
                {resendTime && (
                  <Text>
                    <Icon name="clock-o" style={styles.resendDisabled} />
                    <Text style={styles.resendDisabled}>
                      {' '}
                      {resendTime}
                      {'  '}
                    </Text>
                  </Text>
                )}
                <Text
                  style={
                    resendTime ? styles.resendDisabled : styles.resendButton
                  }
                >
                  {getI('confirmation.resend')}
                </Text>
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <Button
          onPress={onNext}
          title={getI('confirmation.next')}
          disabled={loading || code.length < 6}
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
  resend: {
    marginVertical: 30,
    textAlign: 'center',
  },
  resendButton: {
    color: Color.primary,
    textAlign: 'center',
  },
  resendDisabled: {
    color: Color.gray,
    fontSize: 17,
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
  codeFiledRoot: {
    marginTop: 20,
  },
  cellRoot: {
    width: 60,
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.background,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 15,
  },
  cellText: {
    color: Color.black,
    fontSize: 40,
    textAlign: 'center',
  },
  focusCell: {
    borderColor: Color.primary,
    borderWidth: 1,
  },
});
