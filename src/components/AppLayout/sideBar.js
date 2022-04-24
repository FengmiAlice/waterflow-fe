
import React from 'react'; 
import {routes}  from '../../router';
import {Link,useLocation} from 'react-router-dom';
import { useStore, observer } from '../../hooks/storeHook';
import logo from '../../logo.svg';
import 'antd/dist/antd.css';
import '../../App.css';
import {Layout, Menu} from 'antd';
const { Sider } = Layout;
const { SubMenu } = Menu;


function SideBar () {
    const { commonStore } = useStore();
    const { sideBarCollapsed } = commonStore;
    const location = useLocation();//获取当前路由
    const { pathname }  = location;
    // const openKeys = [] // 用于根据当前路由默认展开子菜单
    const menuList = getMenuList()
    // 左侧菜单渲染
    function getMenuList() {
        const getLists = (routeList=[]) => {
            let menuList = [];
            // 遍历路由
            routeList.forEach((v) => {
                // console.log(v)
                v.meta = v.meta || {}
                // 排除没有权限访问的路由
                if (v.redirect || v.path === '*' || v.meta.hideMenu) {
                    // console.log("is hide.")
                    return;
                }

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
            // console.log(menuList)
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

    return(
        <div  className="c-PageLayout-sideBar">
            <Layout  className="sideBarLayout">
                <Sider trigger={null} collapsible collapsed={sideBarCollapsed}  className="site-layout-background" >
                     
                    <div className="logoWrap"> <img src={logo} className="logo" alt="logo" /></div>
                    <Menu  theme="dark" mode="inline"  style={{height:'100%', borderRight:0}}  selectedKeys={[pathname]}  >
                        {menuList}
                    </Menu>
                </Sider>
                
                {/* {renderButton() }  
                <Link to="/signIn">跳转到登录页</Link> */}
            </Layout>  
                                
        </div>         
    )
    
}
export default observer(SideBar);