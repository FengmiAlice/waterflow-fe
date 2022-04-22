import React, {Suspense }from 'react'
// import { Navigate } from 'react-router-dom'
import Guard from './guard'
let handleRouteBefore = null;

// 设置路由导航守卫函数
function setRouteBefore (fn) {
  handleRouteBefore = fn
}


// 路由懒加载
function lazyLoad (importFn, meta) {
  meta = meta || {}
  const Element = React.lazy(importFn);
  console.log(Element)

  const lazyElement = 
  (<div>
    <Suspense   fallback={<div></div>}>
      <Element _meta={meta}/>
    </Suspense>
  </div>)

  return (
    <div>
      <Guard
        element={lazyElement}
        meta={meta}
        handleRouteBefore={handleRouteBefore}
      />
    </div>
  )
}

// 路由配置列表数据转换
function transformRoutes (routeList  = this.routes   ) {
  const list = [];
  routeList.forEach(route => {
    console.log(route)
    const obj = { ...route }

    if(obj.path === undefined){
      return;
    }
    if (obj.element) {
      console.log(obj.element)
      obj.element = lazyLoad(obj.element, obj.meta)
    }
  
    delete obj.element
    delete obj.meta
    if (obj.children) {
      obj.children = transformRoutes(obj.children)
    }
    list.push(obj)
  })
  return list;
}

export {
  setRouteBefore,
  transformRoutes,
}
