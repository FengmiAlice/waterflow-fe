import request  from "./request";
/**
  * 请求拦截 config配置项
  * @params {string} url 接口名
  * @params {object} data 传参数据
  * @params {string} method 可选，请求方式，默认
  * @params {boolean} codeList 可选，控制自行处理接口响应异常的code码列表，默认为空数组
  */
 function http(method, url, data) {
    // 默认值
    method = method || 'get'
    let codeList =  [];
    let baseURL = '';
    let headers =  {};
    let withCredentials =true ;
  
    // 返回promise
    return new Promise((resolve, reject) => {
        request({
            url,
            data,
            method,
            codeList,
            headers,
            baseURL,
            withCredentials
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