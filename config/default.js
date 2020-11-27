const ip = require('ip').address();
const PORT = 9001;
let cookie;
const API_DOMAIN = 'http://localhost:8080';
// const API_DOMAIN = 'http://h5test.zuche.com';
module.exports = {
  port: PORT,
  hostname: `${ip}:${PORT}/`, // combo 将要替换的域名
  domain: `//${ip}:${PORT}/`, // 替换后域名
  apiDomain: `//${ip}:${PORT}/mapi`,
  debugUID: '', // 本地调试uid
  proxy: {
    '/mapi/*': {
      target: API_DOMAIN,
      changeOrigin: true,
      onProxyRes(proxyRes, req, res) {
        const cookies = proxyRes.headers['set-cookie'];
        if (!cookie) {
          cookie = cookies;
          // TODO 如有其他cookie需求再做filter
        }
      },
      onProxyReq(proxyReq) {
        if (cookie) {
          proxyReq.setHeader('Cookie', cookie);
        }
      }
    }
  },
  isOpenBrowser: true,
  apiVersion: {
    zuche: 551,
  },
  needTrack: false
};
