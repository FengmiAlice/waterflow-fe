/*
 * @Description: 全局入口组件
 */
import React, { useEffect, useState } from 'react';
import RouterWaiter from './components/RouteGuard/index';
import {  BrowserRouter as Router} from 'react-router-dom';
// import { getUserInfo } from './api/login';
// import { useStore } from './hooks/storeHook'
// import store from './store';
import './App.css';
import  { routes, onRouteBefore}  from './router';
import { getRoutePath } from './utils/appTools';

function App(){
//       const elements = useRoutes(routes)
//      return elements;
      // const store = useStore()
      // const { userStore } = store
      // console.log(userStore)
      const [isRender, setIsRender] = useState(false)
      useEffect(()=> {
            // console.log('---update---', document.lastModified)
            // 判断路由是否可渲染
            const path = getRoutePath();
            // console.log(path)
            if(['/signIn'].includes(path)){
                  setIsRender(true);
            }else{
                  setIsRender(true)
                  // if (!userStore.isGotUserInfo) {
                  //       getUserInfo().then((res) => {
                  //             const data = res.data || {}
                  //             userStore.setUserInfo(data)
                  //             setIsRender(true)
                  //       })
                  // }
            }
      }, []);
     

      return(
            <Router>
                  { isRender ? (<RouterWaiter routes={routes} onRouteBefore={onRouteBefore} />) : null }
            </Router>
      )
}
export default  App;
