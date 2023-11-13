
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
    const getTreeData = (data) => {
        // 获取有children的菜单
        let outputData = [];
        for (const item of data) {
            if (item.path !== undefined) {
                const obj = {
                    key:item.path,
                    label: item.meta.title,
                    path: item.path,
                    children:item.children
                }
                // 判断是否有子菜单
                if (item.children) {
                        // 转化为{label:'',path:'',children:[]}格式
                    let child = item.children.map((v, i) => {
                            // 在左侧菜单栏隐藏
                            if (v.hidden === true) {
                                return null;
                            }
                            return {
                                key:v.path,
                                label: v.meta.title,
                                path: v.path,
                            }
                        })
                    // console.log('左侧菜单',child)
                    obj.children = child;
                    outputData.push(obj);
                    getTreeData(item.children);
                } 
            }
        }
        return outputData;
    }
    const menuItems = getTreeData(routes);
    // console.log('获取菜单', menuItems)
    const navigate = useNavigate();
    const menuItemClick = (e) => {
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
        <div  className="c-PageLayout-sideBar">
            <Layout className="sideBarLayout" >
                <Sider trigger={null} collapsible collapsed={sideBarCollapsed}>
                    <Menu  theme="dark" mode="inline" selectedKeys={[pathname]} defaultSelectedKeys={['1']} defaultOpenKeys={['/index']} items={menuItems} onClick={e=>menuItemClick(e)} />
                        {/* {menuList} */}
                </Sider>
                <div className="toggleIcon" onClick={onToggle}>
                    {sideBarCollapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                </div>
                {/* {renderButton() }  <Link to="/signIn">跳转到登录页</Link> */}
            </Layout>                    
        </div>         
    )
}
export default observer(SideBar);