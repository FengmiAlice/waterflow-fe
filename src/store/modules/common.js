/**
 * @Description: 常规
 */
import { makeAutoObservable } from 'mobx'

export default class Common {
  sideBarCollapsed = false

  constructor () {
    /**
      * state
      */
    this.sideBarCollapsed = window.localStorage.getItem('sideBarCollapsed') === 'true' || false // 侧边栏是否收起

    makeAutoObservable(this)
  }

  /**
    * computed
    */

  /**
    * action
    */
  setSideBarCollapsed (val) {
    this.sideBarCollapsed = val
    window.localStorage.setItem('sideBarCollapsed', this.sideBarCollapsed + '')
  }
}
