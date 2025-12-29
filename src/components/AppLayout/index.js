
/*
 * @Description: 页面整体布局组件
 */
import {useMemo} from 'react';
import { Outlet,Link,useLocation} from 'react-router-dom';
import HeadBar from './headBar';
import SideBar from './sideBar';
import { getRouteMetaMap } from '../../utils/appTools';
import { Layout, Breadcrumb } from 'antd';
import { useStore, observer } from '../../hooks/storeHook';
const {  Content } = Layout;

function AppLayout() {
    const { commonStore } = useStore();
    const { sideBarCollapsed } = commonStore;
    /*面包屑功能 */  
    const location = useLocation();//获取当前路由
    // antd5x版本的面包屑组件，items属性需要传入一个数组，数组中的每一项是一个对象，对象中包含title和href属性
    const breadcrumbItems = useMemo(() => {
        const routeMetaMap = getRouteMetaMap(); // 获取路由映射Map
        // console.log('routeMetaMap---', routeMetaMap)
        const pathSnippets = location.pathname.split('/').filter(i => i);//拆分出当前路径的每一级
        // console.log('pathSnippets---',pathSnippets)//['index','user']
        const urlArray = pathSnippets.map((_, index) => {
            return `/${pathSnippets.slice(0, index + 1).join('/')}`;
        });// 生成路径数组，包含所有父级路径
        // console.log('urlArray---',urlArray)//['/index','/index/user']
         // 创建面包屑项目数组
        const items = urlArray.map((path, index) => {
            let title = routeMetaMap.get(path) || pathSnippets[index] || '无标题';
            // 如果是第一个面包屑且路径是'/index'，可以显示为"首页"
            if (index === 0 && (path === '/index' || pathSnippets[0] === 'index')) {
                title = '首页';
            }
             const titleMap = {
                'consume': '支出',
                'income': '收入',
                // 添加更多映射...
            };
            // 如果标题在映射表中，使用映射值
            if (titleMap[title]) {
                title = titleMap[title];
            }
            // 最后一个面包屑不需要链接
            const isLast = index === urlArray.length - 1;
            return {
                title: isLast ? (
                    <span>{title}</span>
                ) : (
                    <Link to={path}>{title}</Link>
                ),
                key: path,
            };
        })
        return items;
    },[location.pathname])
  return (
    <div className="c-PageLayout-index">
        <HeadBar />
        <div className="appMainWrap">
            <SideBar />
            <div className={sideBarCollapsed === false?'appMain':'hideAppMain'}>
                <Content>
                    <div>            
                        <Breadcrumb items={breadcrumbItems }>
                        </Breadcrumb>
                    </div>
                    <Outlet />
                </Content>
            </div>
        </div>
    </div>
  )
}

export default observer(AppLayout);
