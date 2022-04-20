import logo from '../../logo.svg';
import 'antd/dist/antd.css';
import '../../App.css';
import {Layout, Menu} from 'antd';
import React, {useState}from 'react' 
import {routes}  from '../../router'
import {Link} from 'react-router-dom';//useLocation,matchRoutes
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
const { Sider } = Layout;
const { SubMenu } = Menu;


function SideBar () {
    // const location = useLocation();//获取当前路由
    // const { pathname }  = location;
   
    const menuList = getMenuList()
    // 左侧菜单渲染
    function getMenuList() {
        const getLists = (routeList=[], prePath = '') => {
            console.log(routeList)
            
            let menuList = [];
            // 遍历路由
            routeList.forEach((v) => {
                console.log(v)
                v.meta = v.meta || {}
                // 排除没有权限访问的路由
                if (v.redirect || v.path === '*' || v.meta.hideMenu) {
                    console.log("is hide.")
                    return;
                }
                if (v.path !== undefined) {
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
                } else {
                    console.log("path is undefined")
                }
            })
            console.log(menuList)
            return menuList;
        }
        return getLists(routes);
    }

    const [collapsed,setCollapsed] = useState(false)
    function renderButton(){
        const isCollapse = collapsed;
        if(isCollapse === true){
            return ( <MenuFoldOutlined onClick={ ()=> setCollapsed(!collapsed) }/> )
        }else{
            return ( <MenuUnfoldOutlined  onClick={ ()=>setCollapsed(!collapsed) } /> )
        }
    }

    return(
        <div  className="c-PageLayout-sideBar">
            <Layout  className="sideBarLayout">
                <Sider trigger={null} collapsible collapsed={collapsed}   
                    width={200} className="site-layout-background" >
                     
                    <div className="logoPic"> <img src={logo} className="logo-img" alt="logo" /></div>
                    <Menu  theme="dark" mode="inline"  style={{height:'100%', borderRight:0}}  >
                        {menuList}
                    </Menu>
                </Sider>
                
                {renderButton() }  
                <Link to="/signIn">跳转到登录页</Link>
            </Layout>  
                                
        </div>         
    )
    
}
export default (SideBar);