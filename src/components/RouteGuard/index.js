/*
 * @Description: 主组件
 */
import { useRoutes } from 'react-router-dom'
import Fn from './fn'
function RouterWaiter({routes,onRouteBefore,loading}){
    const fn = new Fn({
        routes,
        onRouteBefore,
        loading,
    })
    // console.log(fn)
    const reactRoutes = fn.transformRoutes();
    // console.log(reactRoutes)
    const elements = useRoutes(reactRoutes);
    return elements;
}
export default  RouterWaiter;