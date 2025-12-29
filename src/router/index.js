
import store from '../store'
import {
    HomeOutlined, MoneyCollectOutlined, PayCircleOutlined, RedEnvelopeOutlined, PoundOutlined,
    AccountBookOutlined, UserAddOutlined, WalletOutlined, SyncOutlined
} from '@ant-design/icons';
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
        path: '/index',
        element: <AppLayout />,
        meta:{
            title:"首页",
            icon: <HomeOutlined />,
        },
        children: [
            {
                path: '/index/aiAnswer',
                meta:{
                    title: 'AI智能记账',
                    icon: <SyncOutlined />,
                },
                component: () => import('../views/user/AiAnswer'),
            },
            {
                path: '/index/budget',
                meta:{
                    title: '预算',
                     icon: <MoneyCollectOutlined />,
                },
                component: () => import('../views/user/Budget'),
            },
            {
                path: '/index/consume',
                meta:{
                    title: '支出',
                    icon:<PayCircleOutlined />,
                },
                component: () => import('../views/user/Consume'),
            },
            {
                path: '/index/income',
                meta:{
                    title: '收入',
                    icon:<RedEnvelopeOutlined />,
                },
                component: () => import('../views/user/Income'),
            },
            {
                path: '/index/invest',
                meta:{
                    title: '理财',
                    icon:<PoundOutlined />,
                },
                children: [
                    {
                        path: '/index/invest/list',
                        meta:{
                            title:'理财列表',
                        },
                        component: () => import('../views/user/invest/Invest'),
                    },
                    {
                        path: '/index/invest/investReport',
                        hidden: true,
                        meta:{
                            title: '理财统计',
                        },
                        component: () => import('../views/user/invest/InvestReport'),
                    },
                ]
            },
            {
                path: '/index/debt',
                meta:{
                    title: '债务',
                    icon:<AccountBookOutlined />,
                },
                children: [
                    {
                        path: '/index/debt/list',
                        meta:{
                            title:'债务列表',
                        },
                         component: () => import('../views/user/debt/Debt'),
                    },  
                    {
                        path: '/index/debt/debtAdd',
                         hidden: true,
                        meta:{
                            title:'债务新增',
                        },
                        component: () => import('../views/user/debt/DebtAdd'),
                    },
                    {
                        path: '/index/debt/debtEdit',
                         hidden: true,
                        meta:{
                            title:'债务编辑',
                        },
                        component: () => import('../views/user/debt/DebtEdit'),
                    },
                    {
                        path: '/index/debt/debtRecordAdd',
                        hidden: true,
                        meta:{
                            title:'债务偿还记录新增',
                        },
                        component: () => import('../views/user/debt/DebtRecordAdd'),
                    },
                    {
                        path: '/index/debt/debtRecordEdit',
                        hidden: true,
                        meta:{
                            title:'债务偿还记录编辑',
                        },
                        component: () => import('../views/user/debt/DebtRecordEdit'),
                    },
                ]
            },
            {
                path: '/index/account',
                meta:{
                    title: '账户',
                    icon:<UserAddOutlined />,
                },
                children: [
                    {
                        path: '/index/account/list',
                        meta:{
                            title:'账户列表',
                        },
                        component: () => import('../views/user/account/Account'),
                    },
                    {
                        path: '/index/account/accountReport',
                        hidden: true,
                        meta:{
                            title: '账户统计',
                        },
                        component: () => import('../views/user/account/AccountReport'),
                    },
                ]
            },    
            {
                path: '/index/report',
                meta:{
                    title: "报告",
                    icon:<WalletOutlined />,
                },
                children: [
                    {
                        path: '/index/report/list',
                        meta:{
                            title:'报告详情页',
                        },
                        component: () => import( '../views/user/report/Report'),
                    },
                    {
                        path: '/index/report/flow',
                        hidden: true,
                        meta:{
                            title: "绘图编辑页",
                        },
                        component: () => import( '../views/user/report/Flow'),
                    },
                ],
                
            },
            
        ]
    },
    {
        path: '/signIn',
        meta:{
            title:'登录页',
            hideMenu: true,
            noLogin:true,
        },
        component: () => import( '../views/login/SignIn'),
        // element:<SignIn />
    },  
    {
        path: '/signUp',
        meta:{
            title:'注册页',
            hideMenu: true,
            noLogin:true,
        },
        component: () => import( '../views/register/SignUp'),
    }, 
    {
        path: '*',
        meta: {
          title: '404',
          hideMenu: true,
          noLogin:true,
        },
        component: () => import('../views/errorPage/Page404'),
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