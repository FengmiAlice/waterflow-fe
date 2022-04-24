
import store from '../store'
import { UserOutlined,HomeOutlined} from '@ant-design/icons';
import AppLayout from '../components/AppLayout';

// import SignIn from '../views/SignIn';
// import SignUp from '../views/SignUp';
// import Page404 from '../views/page404';
// import User from '../views/User';
// import About from '../views/About';
// import TestOne from '../views/TestOne';
// import TestTwo from '../views/TestTwo';

const routes = [
   /**
    * @param {string} title // 路由页面标题，以及侧边栏菜单中的标题
    * @param {element} icon // 侧边栏该路由菜单显示的图标
    * @param {boolean} noLogin // 路由页面是否需要登录访问
    * @param {boolean} hideMenu // 是否在侧边栏中隐藏该路由菜单
    */
    {
        path: '/',
        redirect: '/user',
    },
    {
        path:'/',
        element: <AppLayout />,
        meta:{
            title:"首页",
            icon: <HomeOutlined />,
       
        },
        children:[
           {
               path:'user',
               meta:{
                title:"用户页",
                icon:<UserOutlined />
               },
            component: () => import( '../views/User'),
            //    element:<User />
           },
           {
                path:'about',
                meta:{
                    title:'关于页',
                    icon:<UserOutlined />
                },
                component: () => import('../views/About'),
                // element:<About />
           },
        ]
    },
    {
        path:'test',
        element: <AppLayout />,
        meta:{
            title:"测试页",
            icon: <HomeOutlined />,
          
        },
        children:[
           {
               path:'testOne',
               meta:{
                title:"测试",
                icon:<UserOutlined />
               },
               component: () => import('../views/TestOne'),
            //    element:<TestOne />
           },
           {
               path:'testTwo',
               meta:{
                title:'测试2',
                icon:<UserOutlined />
               },
               component: () => import('../views/TestTwo'),
            //    element:<TestTwo />
           },
        ]
    },
    {
        path:'/signIn',
        meta:{
            title:'登录页',
            hideMenu: true,
            noLogin:true,
        },
        component: () => import( '../views/SignIn'),
        // element:<SignIn />
    },  
    {
        path:'/signUp',
        meta:{
            title:'注册页',
            hideMenu: true,
            noLogin:true,
        },
        component: () => import( '../views/SignUp'),
        // element:<SignUp />
    },  
    {
        path: '*',
        meta: {
          title: '404',
          hideMenu: true,
          noLogin:true,
        },
        component: () => import('../views/page404'),
        // element: <Page404 />,
    },
]
/**
 * Description:全局路由拦截：控制路由配置的element属性
 * pathname:当前路由路径
 * meta:当前路由自定义meta属性
 */
const onRouteBefore = ({ pathname, meta }) =>{
    // console.log(pathname)
    // console.log(meta)
    meta = meta || {}
    const { userStore } = store;
    // 动态修改页面title
    if (meta.title !== undefined) {
      document.title = meta.title
    }
    //判断未登录
    if (!meta.noLogin) {// 路由是否需要登录
        console.log(userStore.isLogin)
        if(userStore.isLogin){//用户是否已登录
         
        }else {
            return `/signIn?redirectUrl=${encodeURIComponent(window.location.href)}`
        }
    }
}

export {
    routes,
    onRouteBefore
}