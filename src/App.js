/*
 * @Description: 全局入口组件
 */
import React, { useEffect, useState } from 'react';
import RouterWaiter from './components/RouteGuard/index';
import { BrowserRouter as Router} from 'react-router-dom';
import { getUserInfo } from './api/login';
import { useStore } from './hooks/storeHook'
import  { routes, onRouteBefore}  from './router';
import { getRoutePath } from './utils/appTools';

function App(){
      const store = useStore();
      const { userStore } = store;
      const [isRender, setIsRender] = useState(false);

      useEffect(()=> {
            // 判断路由是否可渲染
            const path = getRoutePath();
            // console.log(path) 

            if(['/signIn'].includes(path)){
                  setIsRender(true);
            }else{
                  // if (userStore.isGotUserInfo === false) {
                        getUserInfo().then((res) => {
                              let data = res.data.obj
                              userStore.setUserInfo(data)
                              setIsRender(true)
                        }).catch((error)=>{
                              console.log(error)
                        })
                  // }
            }
      },[userStore]);
     
    return (
            <Router>
                { isRender ? (<RouterWaiter routes={routes} onRouteBefore={onRouteBefore} />) : null }
            </Router>
      )
}
export default  App;
