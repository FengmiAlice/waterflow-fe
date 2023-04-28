/**
 *  @Description: store状态管理context隔代传递props数据
*/
import React from 'react'
import store from '../store'
const StoreContext = React.createContext(store)
export default StoreContext;