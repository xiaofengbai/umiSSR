import 'isomorphic-unfetch';
import { message } from 'antd';
import { isBrowser } from 'umi';
import cookie from 'js-cookie';
const REQUEST_TIEM_OUT = 10 * 1000;
const LOADING_TIME_OUT = 2000;

export interface Settings {
  noLoading: boolean;
  textContent: boolean;
  noPrefix: boolean;
}

class ProxyFetch {
  static fetchInstance: ProxyFetch;
  fetchInstance: any;
  headers: any;
  init: Object;
  requestCount: number;
  isLoading: boolean;
  loadingTimer: any;

  constructor() {
    this.fetchInstance = null;
    this.headers = { 'Content-Type': 'application/json' };
    this.init = { credentials: 'include', mode: 'cors' };
    this.requestCount = 0;
    this.isLoading = false;
    this.loadingTimer = null;
  }

  /**
   * 请求2s内没有响应显示loading
   */
  showLoading() {
    if (this.requestCount === 0) {
      this.loadingTimer = setTimeout(() => {
        this.isLoading = true;
        this.loadingTimer = null;
      }, LOADING_TIME_OUT);
    }
    this.requestCount++;
  }

  hideLoading() {
    this.requestCount--;
    if (this.requestCount === 0) {
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer);
        this.loadingTimer = null;
      }
      if (this.isLoading) {
        this.isLoading = false;
      }
    }
  }

  /**
   * 获取proxyFetch单例对象
   */
  static getInstance() {
    if (!this.fetchInstance) {
      this.fetchInstance = new ProxyFetch();
    }
    return this.fetchInstance;
  }

  /**
   * get请求
   * @param {String} url
   * @param {Object} params
   * @param {Object} settings: { noLoading }
   */
  async get(url: string, params: any = {}, settings?: Settings) {
    const options = { method: 'GET' };
    if (params) {
      let paramsArray: string[] = [];
      Object.keys(params).forEach((key: string) => {
        if (params[key] instanceof Array) {
          const value = params[key].map((item: any) => '"' + item + '"');
          paramsArray.push(key + '=[' + value.join(',') + ']');
        } else {
          paramsArray.push(key + '=' + params[key]);
        }
      });
      if (url.search(/\?/) === -1) {
        url += '?' + paramsArray.join('&');
      } else {
        url += '&' + paramsArray.join('&');
      }
    }
    return await this.dofetch(url, options, settings);
  }

  /**
   * post请求
   * @param {String} url
   * @param {Object} params
   * @param {Object} settings: { noLoading }
   */
  async post(url: string, params = {}, settings: Settings) {
    const options = { method: 'POST', body: '' };
    options.body = JSON.stringify(params);
    return await this.dofetch(url, options, settings);
  }

  /**
   * put请求
   * @param {String} url
   * @param {Object} params
   * @param {Object} settings: { noLoading }
   */
  async put(url: string, params = {}, settings: Settings) {
    const options = { method: 'PUT', body: '' };
    options.body = JSON.stringify(params);
    return await this.dofetch(url, options, settings);
  }

  /**
   * put请求
   * @param {String} url
   * @param {Object} params
   * @param {Object} settings: { noLoading }
   */
  async delete(url: string, params = {}, settings: Settings) {
    const options = { method: 'DELETE', body: '' };
    options.body = JSON.stringify(params);
    return await this.dofetch(url, options, settings);
  }

  /**
   * fetch主函数
   * @param {*} url
   * @param {*} options
   * @param {Object} settings: { noLoading, }
   */
  dofetch(
    url: string,
    options: any,
    settings: Settings = {
      noLoading: false,
      textContent: false,
      noPrefix: false,
    },
  ) {
    const { noLoading, textContent, noPrefix } = settings;
    let authorization = '';
    if (isBrowser()) {
      const user_token = cookie.get('user_token');
      if (user_token && user_token != 'undefined' && user_token != undefined && typeof user_token != undefined && user_token != '') {
        authorization = user_token;
      }
    } else {
      const tempGl: any = global;
      authorization = tempGl?._cookies?.user_token;
    }
    this.headers['authorization'] = authorization;

    if (!isBrowser() && !noLoading) {
      this.showLoading();
    }
    const prefix = isBrowser() ? process.env.BACKEND_URL_SERVER_SIDE : process.env.BACKEND_URL;
    const init = this.init;
    return Promise.race([
      fetch(noPrefix ? url : url, {
        headers: textContent ? { 'Content-Type': 'text/plain' } : this.headers,
        ...init,
        ...options,
      }),
      new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('请求超时，请稍后再试')), REQUEST_TIEM_OUT);
      }),
    ])
      .then(async (response: any) => {
        !isBrowser() && !noLoading && this.hideLoading();
        const result = await response.json();
        if (result?.success) {
          return result;
        } else if (isBrowser()) {
          message.error(result?.errmsg);
        } else {
          throw new Error('请求异常');
        }
      })
      .catch(e => {
        if (!isBrowser() && !noLoading) {
          this.hideLoading();
        }
        return {
          success: false,
          errmessage: e.message,
          data: [],
        };
      });
  }
}

export default ProxyFetch.getInstance();
