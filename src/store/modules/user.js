/**
 * @Description: 用户模块
 * @Author: Neo
 * @Date: 2021-12-21
 * @LastEditTime: 2021-12-27
 * @LastEditors: Neo
 */
import { makeAutoObservable } from 'mobx'

// interface UserInfoType {
//   [propName: string]: any;
// }

export default class User {
  ticket = ''
  userInfo = {}

  constructor () {
    /**
     * state
     */
    this.ticket = window.localStorage.getItem('ticket') || '' // 登录ticket
    this.userInfo = {} // 用户信息

    makeAutoObservable(this)
  }

  /**
   * computed
   */
  // 是否已登录
  get isLogin () {
    return !!this.ticket
  }

 

  /**
   * action
   */
  setTicket (val) {
    this.ticket = val || ''
    window.localStorage.setItem('ticket', this.ticket)
  }


}
