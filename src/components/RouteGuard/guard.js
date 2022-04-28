/**
 *  Description:页面路由容器组件
 * 在路由渲染的时候执行里面的逻辑，调用路由拦截函数，做统一的路由前置钩子，既可以统一处理又能控制拦截跳转
 */
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
let temp = null;
function Guard ( { element, meta, onRouteBefore} ) {
  meta = meta || {}
  const location = useLocation()
  const { pathname } = location;

  const navigate = useNavigate()

  if (onRouteBefore) {
    if (temp === element) {
      return element
    }
    const pathRes = onRouteBefore({ pathname, meta });
    const pathResType = Object.prototype.toString.call(pathRes).match(/\s(\w+)\]/)[1];
    if (pathResType === 'Promise') {
      pathRes.then(res => {
        if (res && res !== pathname) {
          navigate(res, { replace: true })
        }
      })
    } else {
      if (pathRes && pathRes !== pathname) {
        element = <Navigate to={pathRes} replace={true} />
      }
    }
  }

  temp = element;
  return element;
}
export default Guard;
