
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
    // console.log('map集合',routeMetaMap)
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
            <Col xs={24} sm={24} md={6} lg={4} xl={3}>
            {/* .style={{minHeight: 'calc(100vh - 50px)'}} */}
              <SideBar />
            </Col>
            <Col xs={24} sm={24} md={18} lg={20} xl={21} className='appMain'>
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
