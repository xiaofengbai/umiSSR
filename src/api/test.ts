import request from '@/utils/proxyFetch';

export const _text = (params?: any): any => {
  return request.get('https://kp.huodong.hetaobiancheng.com/edu-school-api/student/v1/queryStudentById', params);
};
