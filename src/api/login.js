
import  request  from '../utils/request';
import  http  from '../utils/http';
// 登录
export function doSignIn(data){
    return http('post','/proxy/login',data)
    // return request({
    //     url:'/proxy/login',
    //     method:'post',
    //     data
    // })
}
// 退出
export function doSignUp(data){
    return request({
        url:'/proxy/signUp',
        method:'post',
        data
    })
}
// 获取个人信息
export function getUserInfo(){
    return request({
        url:'/proxy/userInfo',
        method:'get',
        
    })
}
// 更新个人信息

export function updateUserInfo(data){
    return request({
        url:'/proxy/user/update',
        method:'post',
        data
    })
}