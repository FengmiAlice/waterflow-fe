
import  http  from '../utils/http';

// 登录
export function doSignIn(data){
    return http('post','/api1/login',data)
}

// 退出
export function doSignUp(data){
    return http('post','/api1/signUp',data)
}

// 获取个人信息
export function getUserInfo(){
    return http('get','/api1/userInfo')
}

// 更新个人信息
export function updateUserInfo(data){
    return http('post','/api1/user/update',data)
}