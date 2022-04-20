/**
 * @Description: proxy本地代理配置
 */
 const { createProxyMiddleware } = require('http-proxy-middleware')

 const proxyConfig = {
   '/proxy': {
     target: 'http://waterflow-cloud.cn/',
     changeOrigin: true,
     secure: false,
     pathRewrite: { '^/proxy': '' }
   },
 }
 
 module.exports = function setupProxy (app) {
   Object.keys(proxyConfig).forEach(key => {
     app.use(key, createProxyMiddleware({
       logLevel: 'warn',
       ...(proxyConfig)[key],
     }))
   })
 }