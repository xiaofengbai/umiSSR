import { Effect, ImmerReducer, Reducer, Subscription } from 'umi';
import { _text } from '@/api/test';
export interface IndexModelState {
  name?: string;
  data?: any;
}
export interface IndexModelType {
  namespace: '_test';
  state: IndexModelState;
  effects: {
    query: Effect;
  };
  reducers: {
    save: Reducer<IndexModelState>;
  };
}
const IndexModel: IndexModelType = {
  namespace: '_test',
  state: {
    name: 'fweg',
    data: null,
  },
  effects: {
    *query({ payload }, { call, put }) {
      const { data } = yield call(_text, payload);
      yield put({ type: 'save', data });
    },
  },
  reducers: {
    save(state, { data }) {
      return {
        ...state,
        data,
      };
    },
  },
};
export default IndexModel;
