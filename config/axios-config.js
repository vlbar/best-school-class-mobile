import createAuthRefreshInterceptor from 'axios-auth-refresh';
import SecureStorage from 'react-native-secure-storage';
import Resource from '../src/utils/Hateoas/Resource';
import axios from 'axios';

export const BASE_PATH = 'https://dss-course-work.herokuapp.com/api';

const retryAuth = async failedRequest => {
  const refreshToken = await SecureStorage.getItem('refreshToken');
  const initialCridentials = { refreshToken };
  return await axios
    .post(`v2/auth/tokens?refreshToken`, initialCridentials, {
      skipAuthRefresh: true,
    })
    .then(() => {
      return Promise.resolve();
    })
    .catch(() => {
      SecureStorage.removeItem('token');
      SecureStorage.removeItem('refreshToken');
      return Promise.reject();
    });
};

function setBaseURL(axios) {
  axios.defaults.baseURL = BASE_PATH;
}

function applyAuthorizationTokenHeader(axios) {
  axios.interceptors.request.use(async request => {
    const token = await SecureStorage.getItem('token');
    if (token) request.headers.Authorization = `Bearer ${token}`;
    return request;
  });
}

function createHalResourceInterceptor(axios) {
  axios.interceptors.response.use(response => {
    if (response.data) Resource.wrap(response.data);

    return response;
  });
}

function configureAxios(axios) {
  setBaseURL(axios);
  applyAuthorizationTokenHeader(axios);
  createAuthRefreshInterceptor(axios, retryAuth);
  createHalResourceInterceptor(axios);
}

export default configureAxios;
