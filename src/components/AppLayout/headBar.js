/**
 * @Description: 顶部栏
*/
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DownOutlined,
  } from '@ant-design/icons'
  import { useStore, observer } from '../../hooks/storeHook'
  import { Breadcrumb, Menu, Dropdown, } from 'antd'
  import { useLocation, useNavigate } from 'react-router-dom'
  import '../../App.css'
function HeadBar () {
    const { commonStore, userStore } = useStore()
    const { sideBarCollapsed } = commonStore;
    const { userInfo } = userStore;
    const navigate = useNavigate();

    // 返回首页
    function toPageHome () {
        navigate('/user')
    }
    //   退出登录
    function onLogout () {
        userStore.setToken('')
        navigate('/signIn')
    }
    // 折叠菜单栏
    function onToggle () {
        commonStore.setSideBarCollapsed(!sideBarCollapsed)
    }

      return (
        <div className="c-PageLayout-headBar">
          <div className="headLeft">
            {/* 侧边栏折叠按钮 */}
            <div className="toggleIcon" onClick={onToggle}>
              {sideBarCollapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
            </div>
            {/* 面包屑导航 */}
            {/* <Breadcrumb>
              {extraBreadcrumbItems}
            </Breadcrumb> */}
          </div>
    
          <div className="headRight">
            <Dropdown
              className="userMenu"
              overlay={
                <Menu>
                  <Menu.Item key="0">
                    <div onClick={toPageHome}>首页</div>
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="3">
                    <div className="logout" onClick={onLogout}>退出</div>
                  </Menu.Item>
                </Menu>
              }
            >
              <div>{userInfo.nickName || ''}<DownOutlined className="iconArrowDown"/></div>
            </Dropdown>
          </div>
        </div>
      )
}
export default observer(HeadBar);