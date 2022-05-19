/**
 *  @Description: store状态管理context隔代传递props数据
*/
import React from 'react'
import store from '../store'
const storeContext = React.createContext(store)
export default storeContext;