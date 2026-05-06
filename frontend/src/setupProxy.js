const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Proxies API paths to the Nest backend during `npm start` (default target port 3001).
 * Override with REACT_APP_API_PROXY, e.g. `http://localhost:3000`.
 */
module.exports = function proxyDev(app) {
  const target = process.env.REACT_APP_API_PROXY || 'http://localhost:3001';
  ['/auth', '/jobs', '/sample', '/health'].forEach((path) => {
    app.use(
      path,
      createProxyMiddleware({
        target,
        changeOrigin: true,
      }),
    );
  });
};
