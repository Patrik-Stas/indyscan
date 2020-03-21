const proxy = require('http-proxy-middleware');

const PROXY_API_URL = process.env.PROXY_API_URL

module.exports = function(app) {
  app.use(proxy('/api', { target: PROXY_API_URL }));
};