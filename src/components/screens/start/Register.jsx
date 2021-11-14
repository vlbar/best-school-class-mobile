import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import { getI } from '../../../utils/Internationalization';
import Button from '../../common/Button';
import Text from '../../common/Text';
import Container from '../../common/Container';
import FormGroup from '../../common/FormGroup';
import InputForm from '../../common/InputForm';
import { LOGIN_SCREEN } from '../../navigation/StartNavigation';
import cumwave from '../../../assets/images/cumwave.png';
import { Formik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import Color from '../../../constants';

const registerSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email('Неверный email')
    .required('Вы не ввели email!'),
  secondName: yup
    .string()
    .trim()
    .min(3, 'Фамилия должна содержать минимум 3 буквы')
    .max(50, 'Фамилия не может содержать больше 50 символов')
    .required('Вы не ввели фамилию!'),
  firstName: yup
    .string()
    .trim()
    .min(2, 'Имя должно содержать минимум 2 буквы')
    .max(30, 'Имя не может содержать больше 30 символов')
    .required('Вы не ввели имя!'),
  middleName: yup
    .string()
    .trim()
    .nullable(true)
    .min(3, 'Отчество должно содержать минимум 3 буквы')
    .max(30, 'Отчество не может содержать больше 50 символов'),
  password: yup
    .string()
    .min(8, 'Пароль должен быть не короче 8 символов!')
    .max(20, 'Пароль не может превышать 20 символов!')
    .required('Вы не ввели пароль!'),
});

function register(values) {
  return axios.post(`v2/accounts/`, values).then(response => {
    return response.data;
  });
}

function Register({ navigation }) {
  const [errorMessage, setErrorMessage] = useState(null);

  function onLogin() {
    navigation.navigate(LOGIN_SCREEN);
  }

  function submit(values, { setSubmitting }) {
    if (values.middleName === '') values.middleName = null;
    setErrorMessage(null);
    setSubmitting(true);
    register(values)
      .then(data => {
        console.log(data);
      })
      .catch(e => {
        if (e.response.status === 409)
          setErrorMessage('Email уже используется!');
        else setErrorMessage(e.response.data.message);
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
                <Text style={styles.title}>
                  {getI('register.title', 'Регистрация')}
                </Text>
                <FormGroup>
                  <InputForm
                    onChange={handleChange('secondName')}
                    onBlur={handleBlur('secondName')}
                    value={values.secondName}
                    errorMessage={
                      errors.secondName &&
                      touched.secondName &&
                      errors.secondName
                    }
                    label={getI('register.secondName', 'Фамилия')}
                    placeholder={getI(
                      'register.secondName-placeholder',
                      'Введите фамилию...',
                    )}
                  />
                  <InputForm
                    onChange={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    value={values.firstName}
                    errorMessage={
                      errors.firstName && touched.firstName && errors.firstName
                    }
                    label={getI('register.firstName', 'Имя')}
                    placeholder={getI(
                      'register.firstName-placeholder',
                      'Введите имя...',
                    )}
                  />
                  <InputForm
                    onChange={handleChange('middleName')}
                    onBlur={handleBlur('middleName')}
                    value={values.middleName}
                    errorMessage={
                      errors.middleName &&
                      touched.middleName &&
                      errors.middleName
                    }
                    label={getI('register.middleName', 'Отчество')}
                    placeholder={getI(
                      'register.middleName-placeholder',
                      'Введите отвество...',
                    )}
                  />
                  <InputForm
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    errorMessage={errors.email && touched.email && errors.email}
                    label={getI('register.email', 'Электронная почта')}
                    placeholder={getI(
                      'register.email-placeholder',
                      'Введите адрес электронной почты...',
                    )}
                  />
                  <InputForm
                    onChange={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    errorMessage={
                      errors.password && touched.password && errors.password
                    }
                    label={getI('register.password', 'Пароль')}
                    placeholder={getI(
                      'register.password-placeholder',
                      'Введите пароль...',
                    )}
                    secureTextEntry={true}
                  />
                </FormGroup>
              </View>
              <View>
                <Button
                  title={getI('register.button', 'Зарегистрироваться')}
                  disabled={!(dirty && isValid && !isSubmitting)}
                  onPress={handleSubmit}
                />
                <TouchableWithoutFeedback onPress={onLogin}>
                  <View style={styles.loginActionContainer}>
                    <Text style={styles.littleText}>
                      {getI('register.login-question', 'Уже есть аккаунт?')}
                    </Text>
                    <Text> </Text>
                    <Text style={[styles.littleText, styles.textActionButton]}>
                      {getI('login.login-button', 'Войти')}
                    </Text>
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
