import React from 'react';
import store from '../store/index'
import { UserOutlined,HomeOutlined} from '@ant-design/icons';
import SignIn from '../views/SignIn';
import SignUp from '../views/SignUp';
import Page404 from '../views/page404';
import User from '../views/User';
import About from '../views/About';
import TestOne from '../views/TestOne';
import TestTwo from '../views/TestTwo';
import AppLayout from '../components/AppLayout';
const routes = [
   /*
        noLogin:true,//当前路由访问是否需要重新登录
        hideMenu: true,//是否在侧边栏隐藏当前路由
   */
    // {path:'/',
    //     redirect:'/user'
    // },
    {
        path:'/',
        element: <AppLayout />,
        meta:{
            title:"首页",
            icon: <HomeOutlined />,
            noLogin:true,
        },
        children:[
           {
               path:'/user',
               meta:{
                title:"用户页",
                icon:<UserOutlined />
               },
               element:<User />
           },
           {
                path:'/about',
                meta:{
                    title:'关于页',
                    icon:<UserOutlined />
                },
                element:<About />
           },
        ]
    },
    {
        path:'/test',
        element: <AppLayout />,
        meta:{
            title:"测试页",
            icon: <HomeOutlined />,
            noLogin:true,
        },
        children:[
           {
               path:'/test/testOne',
               meta:{
                title:"测试",
                icon:<UserOutlined />
               },
               element:<TestOne />
           },
           {
               path:'/test/testTwo',
               meta:{
                title:'测试2',
                icon:<UserOutlined />
               },
               element:<TestTwo />
           },
        ]
    },
    {
        path:'/signIn',
        meta:{
            title:'登录页',
            noLogin:true,
            hideMenu: true,
        },
        element:<SignIn />
    },  
    {
        path:'/signUp',
        meta:{
            title:'注册页',
            noLogin:true,
            hideMenu: true,
        },
        element:<SignUp />
    },  
    {
        path: '*',
        meta: {
          title: '404',
          noLogin: true,
          hideMenu: true,
        },
        element: <Page404 />,
    },

]
const onRouteBefore = ({ pathname, meta }) => {
    const { userStore } = store
  
    // 动态修改页面title
    if (meta.title !== undefined) {
      document.title = meta.title
    }
  
    // 登录及权限判断
    console.log(meta.noLogin)
    if (!meta.noLogin) { // 路由是否需要登录
      
      if (userStore.isLogin) { // 用户是否已登录
  
      } else {
        return `/signIn?redirectUrl=${encodeURIComponent(window.location.href)}`
      }
    }
  }
export {
    routes,
    onRouteBefore,
}