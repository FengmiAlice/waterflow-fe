
/*
 * @Description: 页面整体布局组件
 */

import { Outlet,Link,useLocation} from 'react-router-dom';
import HeadBar from './headBar';
import SideBar from './sideBar';
import { getRouteMetaMap } from '../../utils/appTools';
import {Layout,Breadcrumb,Row,Col } from 'antd';
const {  Content } = Layout;

function AppLayout () {
    /*面包屑功能 */ 
    //获取当前路由
    const location = useLocation();
    //map对象集合
    const routeMetaMap = getRouteMetaMap();
    //拆分出当前路径
    const pathSnippets = location.pathname.split('/').filter(i => i);
    // console.log(pathSnippets)//['index','user]
    // 获取父路径及子路径
    const urlArray=  pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
      return url;
    })

    const extraBreadcrumbItems = urlArray.map((v,index)=>{  
      return(
        <Breadcrumb.Item key={v}>
            <Link to={v}>{routeMetaMap.get(v)} </Link>
        </Breadcrumb.Item>
      )
  })
  // console.log(extraBreadcrumbItems)//元素集合
  
  return (
    <div className="c-PageLayout-index">
      <Row >
        <Col span={24}>
          <HeadBar />
        </Col>
      </Row>
      <div className="appMainWrap">
          <Row>
            <Col xs={24} sm={24} md={6} lg={4} xl={4}>
            {/* .style={{minHeight: 'calc(100vh - 50px)'}} */}
              <SideBar />
            </Col>
            <Col xs={24} sm={24} md={18} lg={20} xl={20} className='appMain'>
            {/* style={{minHeight: 'calc(100vh - 50px)',padding:'15px' }} */}
                <Content>
                  <div>            
                      <Breadcrumb>
                          {extraBreadcrumbItems}
                      </Breadcrumb>
                  </div>
                    <Outlet />
                </Content>
            </Col>
          </Row>
      </div>
    </div>
  )
}

export default AppLayout;



// import React,{useState,useEffect,Component}from 'react' 
// import routes  from '../router'
// import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';//UserOutlined, VideoCameraOutlined,LaptopOutlined,
// import {Link,Outlet,useLocation,matchRoutes} from 'react-router-dom';//
// import logo from '../logo.svg';
// import 'antd/dist/antd.css';
// import '../App.css';
// import {Layout, Menu, Button} from 'antd';
// const { Sider, Content } = Layout;
// const { SubMenu } = Menu;


// class AppLayout extends Component{
//             constructor(){
//                 super()
//                 this.state={
//                     collapsed:false
//                 }
            
//             }     
//             handleToggle = ()=>{
//                 this.setState({
//                     collapsed:!this.state.collapsed
//                 })
//             }
//             // 左侧菜单渲染
//              getMenuList = ()=> {
//                 const getLists = (routeList=[], prePath = '') => {
//                     console.log(routeList)
//                   let menuList = []
//                   routeList.forEach((v) => {
//                         console.log(v)
//                         // v.meta = v.meta || {}
//                     if (v.redirect || v.path === '*' || v.meta.hideMenu) {
//                       return;
//                     }
//                     if (v.path !== undefined) {
//                         if (v.children) {
//                             menuList.push((
//                             <SubMenu key={v.path} title={v.meta.title} icon={v.meta.icon} >
//                                 {getLists(v.children)}
//                             </SubMenu>
//                             ))
                      
//                         } else {
//                             menuList.push((
//                             <Menu.Item key={v.path}  icon={v.meta.icon}>
//                                 <Link to={v.path}>{v.meta.title}</Link>
//                             </Menu.Item>
//                             ))
//                         }
//                     } 
//                   })
//                   console.log(menuList)
//                   return menuList
//                 }
//                 return getLists(routes)
//             }

//             render(){
//                 return(
//                     <div>
//                         <Layout>
//                             <Sider trigger={null} collapsible collapsed={this.state.collapsed}   
//                                 width={200} className="site-layout-background" >
//                                 <div className="logoPic"> <img src={logo} className="App-logo" alt="logo" /></div>
//                                 <Menu  theme="dark" mode="inline"  style={{height:'100%', borderRight:0}}  >
//                                     {this.getMenuList()}
//                                 </Menu>
//                             </Sider>
//                             <Layout  className="site-layout" style={{padding:24,margin:0,minHeight:200}}> 
//                                 <Button onClick={this.handleToggle}>toggle</Button>
//                                 <Content  className="site-layout-background"  style={{ margin: '24px 16px', padding: 24,minHeight: 280 }}>
//                                     <Outlet />
//                                 </Content>
//                             </Layout>
                    
//                         </Layout>                         
//                     </div>         
//                 )
//             }
    
// }


// export default AppLayout;
