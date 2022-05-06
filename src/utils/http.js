import request  from "./request";
/**
  * 请求拦截 config配置项
  * @params {string} url 接口名
  * @params {object} data 传参数据
  * @params {string} method 请求方式
  */
 function http(method, apiUrl, data) {
    // 默认值
    method = method || 'get';
  
    // 返回promise
    return new Promise((resolve, reject) => {
        request({
            url:apiUrl,
            data:data,
            method:method
        })
            .then(res => {
            resolve(res)
            })
            .catch(error => {
            reject(error)
            })
    })
  }
  
  export default http;