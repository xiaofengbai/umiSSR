const parseCookie = ctx => {
  let cookies = ctx.get('cookie');
  if (!cookies) {
    return [];
  }
  cookies = cookies.split(';');
  const res = {};
  for (const item of cookies) {
    const kv = item.split('=');
    if (kv && kv.length > 0) {
      res[kv[0].trim()] = decodeURIComponent(kv[1]);
    }
  }
  return res;
};

module.exports = {
  parseCookie,
};
