
import store from '../store'
import { UserOutlined,HomeOutlined} from '@ant-design/icons';
import AppLayout from '../components/AppLayout';

const routes = [
   /**
    * 路由统一管理配置
    * @param {string} title // 路由页面标题，以及侧边栏菜单中的标题
    * @param {element} icon // 侧边栏该路由菜单显示的图标
    * @param {boolean} noLogin // 路由页面是否需要登录访问
    * @param {boolean} hideMenu // 是否在侧边栏中隐藏该路由菜单
    */
    {
        path:'/',
        redirect: '/index/consume',
    },
    {
        path:'/index',
        element: <AppLayout />,
        meta:{
            title:"首页",
            icon: <HomeOutlined />,
        },
        children:[
            {
                path:'/index/consume',
                meta:{
                    title:'支出',
                    icon:<UserOutlined />
                },
                component: () => import('../views/user/Consume'),
                // element:<About />
            },
            {
                path:'/index/income',
                meta:{
                    title:'收入',
                    icon:<UserOutlined />
                },
                component: () => import('../views/user/Income'),
                
            },
            {
                path:'/index/report',
                meta:{
                    title:'报告',
                    icon:<UserOutlined />
                },
                component: () => import('../views/user/Report'),
            
            },
        ]
    },
    // {
    //     path:'/test',
    //     element: <AppLayout />,
    //     meta:{
    //         title:"测试页",
    //         icon: <HomeOutlined />,
          
    //     },
    //     children:[
    //        {
    //            path:'/test/testOne',
    //            meta:{
    //             title:"测试1",
    //             icon:<UserOutlined />
    //            },
    //            component: () => import('../views/test/TestOne'),
    //         //    element:<TestOne />
    //        },
    //        {
    //            path:'/test/testTwo',
    //            meta:{
    //             title:'测试2',
    //             icon:<UserOutlined />
    //            },
    //            component: () => import('../views/test/TestTwo'),
    //        },
    //     ]
    // },

    // {
    //     path:'/userInfo',
    //     meta:{
    //         title:"个人信息页",
    //         hideMenu: true,
    //         noLogin:true,
    //     },
    //     component: () => import( '../views/user/UserInfo'),
    // },
    {
        path:'/signIn',
        meta:{
            title:'登录页',
            hideMenu: true,
            noLogin:true,
        },
        component: () => import( '../views/login/SignIn'),
        // element:<SignIn />
    },  
    {
        path:'/signUp',
        meta:{
            title:'注册页',
            hideMenu: true,
            noLogin:true,
        },
        component: () => import( '../views/register/SignUp'),
        // element:<SignUp />
    },  
    {
        path: '*',
        meta: {
          title: '404',
          hideMenu: true,
          noLogin:true,
        },
        component: () => import('../views/errorPage/Page404'),
        // element: <Page404 />,
    },
]
/**
 * 全局路由拦截思路：控制路由配置的element属性
 * Description:全局路由拦截钩子函数
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
        // console.log(userStore.isLogin)
        if(userStore.isLogin){//用户是否已登录
         
        }else {
            return `/signIn`
        }
    }
}

export {
    routes,
    onRouteBefore
}