/**
 * @Description: proxy本地代理配置
 */
 const { createProxyMiddleware } = require('http-proxy-middleware')

 const proxyConfig = {
   '/api1': {
     target: 'http://waterflow-cloud.cn/',//设定目标服务器的 host
     changeOrigin: true,//是否将主机标头的来源更改为目标URL
     secure: false,//是否验证SSL证书
     ws:false,//是否代理websockets
     pathRewrite: { //重写path地址
       '^/api1': '' 
      }//将客户端请求路径转化为目标服务器地址
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