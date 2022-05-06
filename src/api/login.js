
import  http  from '../utils/http';

// 登录
export function doSignIn(data){
    return http('post','/proxy/login',data)
}

// 退出
export function doSignUp(data){
    return http('post','/proxy/signUp',data)
}

// 获取个人信息
export function getUserInfo(){
    return http('get','/proxy/userInfo')
}

// 更新个人信息
export function updateUserInfo(data){
    return http('post','/proxy/update',data)
}