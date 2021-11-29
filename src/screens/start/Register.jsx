import React, { useContext, useState } from 'react';
import * as yup from 'yup';
import axios from 'axios';
import SecureStorage from 'react-native-secure-storage';
import { Formik } from 'formik';
import { StyleSheet, View, TouchableWithoutFeedback, ScrollView, Image, SafeAreaView } from 'react-native';

import Button from '../../components/common/Button';
import Color from '../../constants';
import Container from '../../components/common/Container';
import cumwave from '../../assets/images/cumwave.png';
import ErrorAlert from '../../components/common/ErrorAlert';
import FormGroup from '../../components/common/FormGroup';
import InputForm from '../../components/common/InputForm';
import Text from '../../components/common/Text';
import { CONFIRMATION_SCREEN } from './Confirmation';
import { getI } from '../../utils/Internationalization';
import { LOGIN_SCREEN } from './Login';
import { TemporaryLoginContext } from '../../../App';

function register(values) {
  return axios.post(`v2/accounts/`, values).then(response => {
    return response.data;
  });
}

export const REGISTER_SCREEN = 'Register';
function Register({ navigation }) {
  const [error, setError] = useState(null);
  const { setIsSignedIn } = useContext(TemporaryLoginContext);

  const registerSchema = yup.object().shape({
    email: yup
      .string()
      .trim()
      .email(getI('register.validation.email-incorrect'))
      .required(getI('register.validation.email-required')),
    secondName: yup
      .string()
      .trim()
      .min(3, getI('register.validation.second-name-min'))
      .max(50, getI('register.validation.second-name-max'))
      .required(getI('register.validation.second-name-required')),
    firstName: yup
      .string()
      .trim()
      .min(2, getI('register.validation.first-name-min'))
      .max(30, getI('register.validation.first-name-max'))
      .required(getI('register.validation.first-name-required')),
    middleName: yup
      .string()
      .trim()
      .nullable(true)
      .min(3, getI('register.validation.middle-name-min'))
      .max(30, getI('register.validation.middle-name-max')),
    password: yup
      .string()
      .min(8, getI('register.validation.password-min'))
      .max(20, getI('register.validation.password-max'))
      .required(getI('register.validation.password-required')),
  });

  function onLogin() {
    navigation.navigate(LOGIN_SCREEN);
  }

  function afterConfirm(data) {
    Promise.all([
      SecureStorage.setItem('token', data.token),
      SecureStorage.setItem('refreshToken', data.refreshToken),
    ]).then(() => setIsSignedIn(true));
  }

  function submit(values, { setSubmitting }) {
    if (values.middleName === '') values.middleName = null;
    setError(null);
    setSubmitting(true);
    register(values)
      .then(data => {
        navigation.navigate({
          name: CONFIRMATION_SCREEN,
          params: {
            email: data.email,
            onSuccess: afterConfirm.bind(this),
          },
        });
      })
      .catch(e => {
        if (e.request.status == 409) setError('register.email-already-in-use');
        console.log(e);
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Image source={cumwave} style={styles.cumwave} />
        <Formik
          initialValues={{
            email: '',
            secondName: '',
            firstName: '',
            middleName: '',
            password: '',
          }}
          validationSchema={registerSchema}
          onSubmit={(values, { setSubmitting }) => {
            const castedValues = registerSchema.cast(values);
            submit(castedValues, { setSubmitting });
          }}
        >
          {({
            dirty,
            isValid,
            touched,
            isSubmitting,
            submitForm,
            setFieldError,
            errors,
            handleChange,
            handleBlur,
            handleSubmit,
            values,
          }) => (
            <Container style={styles.container}>
              <View>
                <Text style={styles.title}>{getI('register.title')}</Text>
                <ErrorAlert message={getI(error)}></ErrorAlert>
                <FormGroup>
                  <InputForm
                    onChange={handleChange('secondName')}
                    onBlur={handleBlur('secondName')}
                    value={values.secondName}
                    errorMessage={errors.secondName && touched.secondName && errors.secondName}
                    label={getI('register.second-name')}
                    placeholder={getI('register.second-name-placeholder')}
                  />
                  <InputForm
                    onChange={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    value={values.firstName}
                    errorMessage={errors.firstName && touched.firstName && errors.firstName}
                    label={getI('register.first-name')}
                  />
                  <InputForm
                    onChange={handleChange('middleName')}
                    onBlur={handleBlur('middleName')}
                    value={values.middleName}
                    errorMessage={errors.middleName && touched.middleName && errors.middleName}
                    label={getI('register.middle-name')}
                  />
                  <InputForm
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    errorMessage={errors.email && touched.email && errors.email}
                    label={getI('register.email')}
                    placeholder={getI('register.email-placeholder')}
                    textContentType="emailAddress"
                    autoComplete="email"
                    keyboardType="email-address"
                  />
                  <InputForm
                    onChange={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    errorMessage={errors.password && touched.password && errors.password}
                    label={getI('register.password')}
                    secureTextEntry={true}
                  />
                </FormGroup>
              </View>
              <View>
                <Button
                  title={getI('register.сontinue')}
                  disabled={!(dirty && isValid && !isSubmitting)}
                  onPress={handleSubmit}
                />
                <TouchableWithoutFeedback onPress={onLogin}>
                  <View style={styles.loginActionContainer}>
                    <Text style={styles.littleText}>{getI('register.login-question')}</Text>
                    <Text> </Text>
                    <Text style={[styles.littleText, styles.textActionButton]}>{getI('register.login-button')}</Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </Container>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    textAlign: 'center',
    color: 'black',
  },
  loginActionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  textActionButton: {
    color: Color.primary,
  },
  littleText: {
    fontSize: 14,
    color: Color.gray,
  },
  cumwave: {
    width: '100%',
    height: 152,
    marginTop: -100,
    resizeMode: 'contain',
    backgroundColor: Color.background,
  },
});

export default Register;
