/**
 *  @Description: store状态管理context
*/
import React from 'react'
import store from '../store'
const storeContext = React.createContext(store)
export default storeContext;