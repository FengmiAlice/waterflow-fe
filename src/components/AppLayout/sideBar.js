
import React from 'react'; 
import {routes}  from '../../router';
import {Link,useLocation} from 'react-router-dom';
import { useStore, observer} from '../../hooks/storeHook';
import {Layout, Menu} from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
  } from '@ant-design/icons'
const { Sider } = Layout;
const { SubMenu } = Menu;


function SideBar () {
    const { commonStore } = useStore();
    const { sideBarCollapsed } = commonStore;
    const location = useLocation();//获取当前路由
    // console.log(location)
    const  {pathname}   = location;
    const menuList = getMenuList();
    // 左侧菜单渲染
    function getMenuList() {
        const getLists = (routeList=[], prePath='') => {
            let menuList = [];
            // 遍历路由
            routeList.forEach((v) => {
                // console.log(v)
                v.meta = v.meta || {};
               
                // 排除没有权限访问的路由
                if (v.redirect || v.path === '*' || v.meta.hideMenu) {
                    // console.log("is hide.")
                    return;
                }
                // if (v.path === '/') {
                //     menuList = menuList.concat(getLists(v.children, '/'));
                //     console.log(menuList)
                // }
                
                 if(v.path !== undefined){
                    // 如果有嵌套路由递归添加菜单
                    if (v.children) {
                        menuList.push((
                        <SubMenu key={v.path} title={v.meta.title} icon={v.meta.icon} >
                            {getLists(v.children)}
                        </SubMenu>
                        ))
                      
                    } 
                    // 无嵌套路由,添加菜单结束
                    else {
                        menuList.push((
                        <Menu.Item key={v.path}  icon={v.meta.icon}>
                            <Link to={v.path}>{v.meta.title}</Link>
                        </Menu.Item>
                        ))
                     
                    }
               
                } 

            })
            
            return menuList;
        }
        return getLists(routes);
    }

    // const [collapsed,setCollapsed] = useState(false)
    // function renderButton(){
    //     const isCollapse = collapsed;
    //     if(isCollapse === true){
    //         return ( <MenuFoldOutlined onClick={ ()=> setCollapsed(!collapsed) }/> )
    //     }else{
    //         return ( <MenuUnfoldOutlined  onClick={ ()=>setCollapsed(!collapsed) } /> )
    //     }
    // }

    // 折叠菜单栏
    function onToggle () {
        commonStore.setSideBarCollapsed(!sideBarCollapsed)
    }

    return(
        <div  className="c-PageLayout-sideBar">
            <Layout  className="sideBarLayout">
                <Sider trigger={null} collapsible collapsed={sideBarCollapsed}>
                    <Menu  theme="dark" mode="inline"  selectedKeys={[pathname]} defaultOpenKeys={['/index/consume']} >
                        {menuList}
                    </Menu>
                </Sider>
                  {/* 侧边栏折叠按钮 */}
                    <div className="toggleIcon" onClick={onToggle}>
                        {sideBarCollapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                    </div>
                {/* {renderButton() }  
                <Link to="/signIn">跳转到登录页</Link> */}
            </Layout>                    
        </div>         
    )
    
}
export default observer(SideBar);