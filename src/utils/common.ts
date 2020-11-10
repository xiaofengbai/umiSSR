import axios, { Method, AxiosResponse, AxiosError, AxiosPromise } from 'axios';
const baseURL = '';
const instance = axios.create();

const codeMap = new Map([
  [200, '服务器成功返回请求的数据。'],
  [201, '新建或修改数据成功。'],
  [202, '一个请求已经进入后台排队（异步任务）。'],
  [204, '删除数据成功。'],
  [400, '发出的请求有错误，服务器没有进行新建或修改数据的操作。'],
  [401, '用户没有权限（令牌、用户名、密码错误）。'],
  [403, '用户得到授权，但是访问是被禁止的。'],
  [404, '发出的请求针对的是不存在的记录，服务器没有进行操作。'],
  [406, '请求的格式不可得。'],
  [410, '请求的资源被永久删除，且不会再得到的。'],
  [422, '当创建一个对象时，发生一个验证错误。'],
  [500, '服务器发生错误，请检查服务器。'],
  [502, '网关错误。'],
  [503, '服务不可用，服务器暂时过载或维护。'],
  [504, '网关超时。'],
]);

interface IresolveErrFn {
  method: Method;
  url: string;
  params: any;
  res: any;
  reject?: any;
}
export interface Iservice {
  timeout?: any;
  requestResolve: Function;
  requestReject?: Function;
  responseResolve?: Function;
  responseReject?(err: AxiosError): void;
  resolveErrFn?(errfn: IresolveErrFn): void;
}

interface IreqParam {
  method: Method;
  url: string;
  params?: any;
  state?: any;
  resolveErrFn?(errfn: IresolveErrFn): void;
}

function connector(service: Iservice) {
  instance.defaults.timeout = service.timeout;
  // 请求拦截器
  instance.interceptors.request.use(
    config => {
      service.requestResolve && service.requestResolve(config);
      return config;
    },
    err => {
      service.requestReject && service.requestReject(err);
      return Promise.reject(err);
    },
  );

  // 响应拦截器
  instance.interceptors.response.use(
    config => {
      service.responseResolve && service.responseResolve(config);
      return config;
    },
    (err: AxiosError): AxiosPromise => {
      let message;
      if (err.response) {
        message = `${err.response.status}：${codeMap.get(err.response.status) ||
          err.message}`;
      } else {
        message = `错误信息：${err.message}`;
      }
      service.responseReject && service.responseReject(err);

      return Promise.reject(err);
    },
  );

  return function({ method, url, params, state, resolveErrFn }: IreqParam) {
    return new Promise((resolve, reject) => {
      instance({
        method,
        url: url,
        baseURL,
        data: ['POST', 'PUT'].includes(method) ? params : null,
        params: ['GET', 'DELETE'].includes(method) ? params : null,
        timeout: state.timeout || 5000,
        withCredentials: false,
      })
        .then(res => {
          if (res.data.errCode || res.data.errcode || res.data.err_code) {
            resolveErrFn && resolveErrFn({ method, url, params, res });
          } else {
            resolve({
              ...res.data,
              headers: res.headers,
            });
          }
        })
        .catch(err => {
          console.log('%c error ', 'color:red;background:#6cf', err);
          reject(err);
        });
    });
  };
}

export default connector;
