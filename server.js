const Koa = require('koa');
const compress = require('koa-compress');
const mount = require('koa-mount');
const { join, extname } = require('path');
const { parseCookie } = require('./serverHelper');
const isDev = process.env.NODE_ENV === 'development';
const root = join(__dirname, 'dist');

const app = new Koa();
app.use(
  compress({
    threshold: 2048,
    gzip: {
      flush: require('zlib').constants.Z_SYNC_FLUSH,
    },
    deflate: {
      flush: require('zlib').constants.Z_SYNC_FLUSH,
    },
    br: false, // 禁用br解决https gzip不生效加载缓慢问题
  }),
);

let render;
app.use(async (ctx, next) => {
  global._cookies = parseCookie(ctx);

  const ext = extname(ctx.request.path);
  if (!ext) {
    if (!render) {
      render = require('./dist/umi.server');
    }
    ctx.type = 'text/html';
    ctx.status = 200;
    const { html, error } = await render({
      path: ctx.request.url,
      getInitialPropsCtx: {
        cookies: global._cookies,
      },
    });
    if (error) {
      console.log('----------------服务端报错-------------------', error);
      ctx.throw(500, error);
    }
    if (isDev) {
      delete require.cache[require.resolve('./dist/umi.server')];
    }
    ctx.body = html;
  } else {
    await next();
  }
});

app.use(mount('/dist', require('koa-static')(root)));

app.listen(7001);
console.log('http://localhost:7001');

module.exports = app.callback();
