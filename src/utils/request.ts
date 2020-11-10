import { AxiosError } from 'axios';
import request from './common';
import cookie from 'js-cookie';
import { message } from 'antd';
import { Iservice } from './common';

const service: Iservice = {
  requestResolve(config: { headers: { [x: string]: any } }) {
    const user_token = cookie.get('user_token');
    if (
      user_token &&
      user_token != 'undefined' &&
      user_token != undefined &&
      typeof user_token != undefined &&
      user_token != ''
    ) {
      config.headers['authorization'] = decodeURIComponent(user_token);
    }
  },
  responseReject(err: AxiosError) {
    if (err.response && err.response.status === 401) {
    }
  },
  resolveErrFn({ res }: any) {
    message.destroy();
    if (location.search.indexOf(status) > 0) return;
    switch (res.data.errcode) {
      case 0:
        message.warning(res.data.errmsg);
        break;
      case 119004:
      case 119001:
      case 119002:
        cookie.remove('login_role');
        cookie.remove('user_id');
        cookie.remove('user_token');
        message.warning('登入过期，请重新登入!', 1, () => {
          location.href = '/';
        });
        break;
      case 113003:
        break;
      default:
        message.warning(res.data.errmsg);
        break;
    }
  },
  timeout: 5000,
};
const requestFn = request(service);

function apiAxios(method: any, url: any, params: any, state: any) {
  return requestFn({
    method,
    url,
    params,
    state: { ...{ timeout: 5000, check: true }, ...state },
    resolveErrFn: service.resolveErrFn,
  });
}

export default {
  get: (url: any, params: any, state?: any) => {
    return apiAxios('GET', url, params, state);
  },
  post: (url: any, params: any, state?: any) => {
    return apiAxios('POST', url, params, state);
  },
  put: (url: any, params: any, state?: any) => {
    return apiAxios('PUT', url, params, state);
  },
  delete: (url: any, params: any, state?: any) => {
    return apiAxios('DELETE', url, params, state);
  },
  patch: (url: any, params: any, state?: any) => {
    return apiAxios('PATCH', url, params, state);
  },
};
