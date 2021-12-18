import createAuthRefreshInterceptor from 'axios-auth-refresh';
import SecureStorage from 'react-native-secure-storage';
import Resource from '../utils/Hateoas/Resource';
import axios from 'axios';

export const BASE_PATH = 'https://dss-course-work.herokuapp.com/api';

function retryAuth(onFault) {
  return async function (failedRequest) {
    const refreshToken = await SecureStorage.getItem('refreshToken');
    const initialCridentials = { refreshToken };
    return await axios
      .post(`v1/auth/token/refresh`, initialCridentials, {
        skipAuthRefresh: true,
      })
      .then(response => {
        SecureStorage.setItem('token', response.data.token);
        SecureStorage.setItem('refreshToken', response.data.refreshToken);
        return Promise.resolve();
      })
      .catch(() => {
        SecureStorage.removeItem('token');
        SecureStorage.removeItem('refreshToken');
        onFault?.();
        return Promise.reject();
      });
  };
}

function setBaseURL() {
  axios.defaults.baseURL = BASE_PATH;
}

function applyAuthorizationTokenHeader() {
  axios.interceptors.request.use(async request => {
    const token = await SecureStorage.getItem('token');
    if (token) request.headers.Authorization = `Bearer ${token}`;
    return request;
  });
}

function createHalResourceInterceptor() {
  axios.interceptors.response.use(response => {
    if (response.data) Resource.wrap(response.data);

    return response;
  });
}

function configureAxios(onRetryAuthFault) {
  setBaseURL();
  applyAuthorizationTokenHeader();
  createAuthRefreshInterceptor(axios, retryAuth(onRetryAuthFault));
  createHalResourceInterceptor();
}

export default configureAxios;
