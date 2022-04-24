
import  Service  from '../utils/request'
export function doSignIn(data){
    return Service({
        url:'/proxy/login',
        method:'post',
        data
    })
}
export function doSignUp(data){
    return Service({
        url:'/proxy/signUp',
        method:'post',
        data
    })
}
export function getUserInfo(){
    return Service({
        url:'/proxy/getUserInfo',
        method:'get',
        
    })
}