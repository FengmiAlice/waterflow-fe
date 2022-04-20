    import axios from 'axios';
    import { baseURL } from './apiIp'
  
    const service = axios.create({
        baseURL: baseURL,//设置公共url
        crossDomain:true,//设置是否允许跨域
        withCredentials:false,//设置是否允许携带cookie
        timeout:5000,//设置超时时间
    })
    // http请求拦截器
    service.interceptors.request.use(
        (config)=>{
            config.headers={
                'Content-Type':'application/json;charset=utf-8'
            }
            return config;
        },
        (error)=>{
            return Promise.reject(error)
        }
    )
    // http响应拦截器
    service.interceptors.response.use((response)=>{
        if(response.code === 200){
            return Promise.resolve(response)
        }else{
            return Promise.reject(response)
        }
    },
    (error)=>{
         // 相应错误处理
        // 比如： token 过期， 无权限访问， 路径不存在， 服务器问题等
        switch (error.response.status) {
            case 401:
                break
            case 403:
                break
            case 404:
                break
            case 500:
                break
            default:
                console.log('其他错误信息')
        }
        return Promise.reject(error)
    }

)
export default service;

