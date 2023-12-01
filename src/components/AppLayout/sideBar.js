
import React from 'react'; 
import { routes } from '../../router';
import {useLocation,useNavigate} from 'react-router-dom';//Link,
import { useStore, observer} from '../../hooks/storeHook';
import {Layout, Menu} from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
  } from '@ant-design/icons'
const { Sider } = Layout;
// const { SubMenu } = Menu;

function SideBar () {
    const { commonStore } = useStore();
    const { sideBarCollapsed } = commonStore;
    const location = useLocation();//获取当前路由
    const { pathname } = location;
    const navigate = useNavigate();
    // const menuList = getMenuList();
    // /*左侧菜单路由渲染*/ 
    // function getMenuList() {
    //     const getLists = (routeList=[], prePath='') => {
    //         let menuList = [];
    //         // 遍历路由
    //         routeList.forEach((v) => {
    //             // console.log(v)
    //             v.meta = v.meta || {};
    //             // 排除没有权限访问的路由
    //             if (v.redirect || v.path === '*' || v.meta.hideMenu) {
    //                 return;
    //             }                
    //             if (v.path !== undefined) {
    //                 // 如果有嵌套路由递归添加菜单
    //                 if (v.children) {
    //                     menuList.push((
    //                     <SubMenu key={v.path} title={v.meta.title} icon={v.meta.icon} >
    //                         {getLists(v.children)}
    //                     </SubMenu>
    //                     ))
    //                 } 
    //                 // 无嵌套路由,添加菜单结束
    //                 else {
    //                     menuList.push((
    //                     <Menu.Item key={v.path}  icon={v.meta.icon}>
    //                         <Link to={v.path}>{v.meta.title}</Link>
    //                     </Menu.Item>
    //                     ))
    //                 }
    //             } 
    //         })
    //         return menuList;
    //     }
    //     return getLists(routes);
    // }
    
    /*
    遍历路由菜单，如果有嵌套路由，则递归遍历，否则直接添加到菜单数组中。
    antd>=4.20.0时Menu.Item语法废弃，取而代之是items。
    */ 
    const transformRoutes = (routes) => {
        return routes.reduce((result,route) => {
            // console.log('----菜单项',route)
                if(route.redirect || route.path === '*' || route.path === undefined || route.meta.hideMenu === true || route.hidden === true){
                    return result;
                }
                const convertedRoute = {
                    key: route.path,
                    label: route.meta.title,
                    path: route.path,
                };
                if (route.children && route.children.length > 0) {
                    convertedRoute.children = transformRoutes(route.children);
                }
                result.push(convertedRoute);
                return result;
        },[])
    }
    const menuItems = transformRoutes(routes);
    // console.log('获取菜单数组---', menuItems);

    const menuItemClick = (e) => {
        // console.log('菜单点击项---',e);
        navigate({ pathname: e.key },{replace:true})
    }
    
    // function renderButton(){
    //     const isCollapse = collapsed;
    //     if(isCollapse === true){
    //         return ( <MenuFoldOutlined onClick={ ()=> setCollapsed(!collapsed) }/> )
    //     }else{
    //         return ( <MenuUnfoldOutlined  onClick={ ()=>setCollapsed(!collapsed) } /> )
    //     }
    // }

    // 折叠菜单栏
    function onToggle() {
        commonStore.setSideBarCollapsed(!sideBarCollapsed)
    }

    return(
        <div className={sideBarCollapsed === false ? 'c-PageLayout-sideBar' : 'c-PageLayout-collapseSideBar'}>
                <Sider trigger={null} collapsible   collapsed={sideBarCollapsed}>
                    <Menu  theme="dark" mode="inline"   defaultSelectedKeys={['/index/consume']} defaultOpenKeys={['/index']} selectedKeys={[pathname]} items={menuItems} onClick={e=>menuItemClick(e)} />
                    {/* {menuList}  */}
                    <div className="toggleIcon" onClick={onToggle}>
                        {sideBarCollapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                    </div>
                </Sider>
                {/* {renderButton() }  <Link to="/signIn">跳转到登录页</Link> */}
        </div>         
    )
}
export default observer(SideBar);