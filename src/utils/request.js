    import axios from 'axios';  
    const Service = axios.create({
        // BaseURL:process.env.PUBLIC_URL,//设置公共url
        crossDomain:true,//设置是否允许跨域
        withCredentials:false,//设置是否允许携带cookie
        timeout:5000,//设置超时时间
    })
    // http请求拦截器
    Service.interceptors.request.use(
        (config)=>{
            // console.log(config)
            config.headers={
                'Content-Type':'application/json;charset=utf-8',
                "dataType": "json",
            }
            return config;
        },
        (error)=>{
            return Promise.reject(error)
        }
    )
    // http响应拦截器
    Service.interceptors.response.use((response)=>{
        // console.log(response)
        const res = response.data;
        if(res.code === 0){
            return Promise.resolve(res)
        }else{
            // 抛出错误信息
            return Promise.reject(res)
        }
    },
    (error)=>{
        // 相应错误处理 比如： token 过期， 无权限访问， 路径不存在， 服务器问题等
        switch (error.code) {
            case 401:
                break
            case 403:
                break
            case 404:
                break
            case 500:
                break
            default:
                console.log(error)
        }
        return Promise.reject(error)
    }

)
export default Service;

