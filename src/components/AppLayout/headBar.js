/**
 * @Description: 顶部栏
*/
import { DownOutlined } from '@ant-design/icons'
  import { useStore, observer } from '../../hooks/storeHook'
  import { Menu, Dropdown, } from 'antd'
  import { useNavigate } from 'react-router-dom';
  import logo from '../../logo.svg';
  import '../../App.css';
 

function HeadBar () {
    const { userStore } = useStore()
    const { userInfo } = userStore;
    const navigate = useNavigate();
    // 跳转到个人信息页
    function turnToUserInfo(){
      navigate('/userInfo')
    }
    //   退出登录
    function onLogout () {
        userStore.setToken('')
        navigate('/signIn')
    }
 
 
      return (
        <div className="c-PageLayout-headBar">
          <div className="headLeft">
              {/* logo图标 */}
              <div className="logoWrap"> <img src={logo} className="logo" alt="logo" /></div>
          </div>
          <div className="headRight">
            <Dropdown
              className="userMenu"
              overlay={
                <Menu>
                  <Menu.Item key="0">
                    <div onClick={turnToUserInfo}>个人信息</div>
                  </Menu.Item>
                  <Menu.Item key="0">
                    <div>修改密码</div>
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="3">
                    <div className="logout" onClick={onLogout}>退出</div>
                  </Menu.Item>
                </Menu>
              }
            >
              <div>{userInfo.name || ''}<DownOutlined className="iconArrowDown"/></div>
            </Dropdown>
          </div>
        </div>
      )
}
export default observer(HeadBar);