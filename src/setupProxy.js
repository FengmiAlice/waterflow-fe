/**
 * @Description: proxy本地代理配置
 */
 const { createProxyMiddleware } = require('http-proxy-middleware')

 const proxyConfig = {
   '/proxy': {
     target: 'http://waterflow-cloud.cn/',//设定目标服务器的 host
     changeOrigin: true,//是否将主机标头的来源更改为目标URL
     secure: false,//是否验证SSL证书
     pathRewrite: { '^/proxy': '' }//将客户端请求路径转化为目标服务器地址
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