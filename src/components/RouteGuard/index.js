/**
 *  @Description: 主组件
 * @param {array} routes 全局路由同意配置数组
 * @param {function} onRouteBefore 全局路由前置钩子
 * @param {object} loading 组件加载状态
 */

import { useRoutes } from 'react-router-dom'
import Fn from './fn'
function RouterWaiter( {routes,onRouteBefore,loading} ){
    const fn = new Fn({
        routes,
        onRouteBefore,
        loading,
    })
    // console.log(fn)//组件工具函数
    // 将自定义的路由配置数组转换为react-router官方需要的路由数组
    const reactRoutes = fn.transformRoutes();
    // 然后通过useRoutes引用
    const elements = useRoutes(reactRoutes);
    return elements;
}
export default  RouterWaiter;