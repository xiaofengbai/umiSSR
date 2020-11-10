import { getDvaApp } from 'umi';
export const ssr = {
  modifyGetInitialPropsCtx: async (ctx: any) => {
    ctx.store = getDvaApp();
    return ctx;
  },
};

export const dva = {
  config: {
    onError(err: ErrorEvent) {
      err.preventDefault();
      // console.error(err.message);
    },
  },
};
