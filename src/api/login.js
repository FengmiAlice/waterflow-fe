
import request from '../utils/request'
export function doSignIn(data){
    return request({
        url:'/login',
        method:'post',
        data
    })
}
export function doSignUp(data){
    return request({
        url:'/signUp',
        method:'post',
        data
    })
}