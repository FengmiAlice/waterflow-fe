    import axios from 'axios';  
    import store from '../store';
    // import { message } from 'antd';

    const { userStore } = store
    // 创建axios实例
    const service = axios.create({
        BaseURL:process.env.PUBLIC_URL,//设置公共url
        crossDomain:true,//设置是否允许跨域
        withCredentials:false,//设置跨域请求中是否需要使用凭证
        timeout:5000,//设置超时时间
    })
    // http请求拦截器
    service.interceptors.request.use(
        (config)=>{
            // console.log(config)
            // 在发送请求之前对请求做一些配置
            let token = userStore.token;
            if(token){
                // 请求配置自定义请求头
                config.headers={
                    'Authorization':token,
                    'Content-Type':'application/json;charset=utf-8',
                    "dataType": "json",
                }
            }
            return config;
        },
        (error)=>{
            // 对请求错误做什么处理
            return Promise.reject(error)
        }
    )
    // http响应拦截器
    service.interceptors.response.use(
        (response)=>{
        //对响应数据做些什么处理
        // console.log(response)
        // 业务code
        //status为200正常返回数据
        if(response.status === 200){
            return Promise.resolve(response)
        }
        return Promise.reject(response)
        
    },
    (error)=>{
        // 对响应错误的数据做些什么处理 比如： token 过期， 无权限访问， 路径不存在， 服务器问题等
        // console.log(error.response)
        let status = error.response.status
         // 如果token过期返回登录页
         if(status === 401){
            const pre = window.location.origin + process.env.PUBLIC_URL
            window.location.href =`${pre}/signIn`
        }
      
        // message.error('Error:'+error.message)
        return Promise.reject(error)
    }

)
export default service;

