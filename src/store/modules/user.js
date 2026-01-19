/**
 * @Description: 用户模块

 */
import { makeAutoObservable } from 'mobx'

export default class User {
    token = '';
    userInfo = {};
    avatar = require('@/assets/images/avatar.png');
  constructor () {
    /**
     * state
     */
    this.token =  window.localStorage.getItem('token')|| '' ;// 登录token
    this.userInfo = window.localStorage.getItem('userInfo') || {} ;// 用户信息
      makeAutoObservable(this);
  }

  /**
   * computed
   */
  // 是否已登录
  get isLogin () {
    if(this.token !== '' && this.token !== null ){
        return true;
    }else{
        return false;
    }
    // return !!this.token;//!!相当于Boolean()方法，把目标转化为布尔值
  }
  // 是否已获取到userInfo
  get isGotUserInfo () {
    if(this.userInfo.id !== undefined){
        return true;
    }else{
        return false;
    }
    // return this.userInfo.id !== undefined
  }
  /**
   * action
   */
  // 设置token
  setToken (val) {
      this.token = val || '';
      window.localStorage.setItem('token', this.token);
  }

  // // 清空token
  // removeToken(){
  //   window.localStorage['token'] = ''
  // }

  // 设置用户信息
  async setUserInfo (userInfo) {
      this.userInfo = userInfo || {};
      window.localStorage.setItem('userInfo', this.userInfo);
  }
}
