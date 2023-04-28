/**
 * @Description: 顶部栏
*/
import React, {  useEffect, useState } from 'react';
import { useStore, observer } from '../../hooks/storeHook';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/img/logo.svg';
import { updateUserInfo } from '../../api/login';
import { Form,Input,Menu, Dropdown,Modal } from 'antd';//Button
import { ExclamationCircleOutlined,DownOutlined } from '@ant-design/icons';
const {confirm} = Modal;
 
function HeadBar () {
      const { userStore } = useStore()
      const { userInfo } = userStore;
      // 使用useForm创建form实例
      const [form] = Form.useForm();
      const navigate = useNavigate();
      const [isModalVisible, setIsModalVisible] = useState(false);
      useEffect(()=>{
        if(isModalVisible){
          //使用setFieldsValue回显表格数据
          form.setFieldsValue(userInfo)
        }
      },[form,userInfo,isModalVisible])
      // 弹出个人信息页弹框
      function turnToUserInfo(){
        setIsModalVisible(true);
      }
      // 个人信息弹窗提交表单数据操作
      function handleSubmit(){
          confirm({
              title: '确认修改?',
              icon: <ExclamationCircleOutlined />,
              okText:"确认",
              cancelText:"取消",
              // 确认按钮操作
              onOk() {
                  form.validateFields().then(async (values) => {
                      // 调用登陆Api，获取结果
                      let params = {
                          name:values.name,
                          phone:values.phone,
                          email:values.email
                      };
                      let res = await updateUserInfo(params);
                      if(res.data.success === true){
                          userStore.setUserInfo(res.data.obj)
                      }
                  })
              },

            });
            setIsModalVisible(true);
      }
      // 个人信息弹窗取消操作
      function handleCancel(){
        setIsModalVisible(false);
      }
      //   退出登录
      function onLogout () {
          userStore.setToken('');
          userStore.setUserInfo({});
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
                  <Menu.Item key="1">
                    <div>修改密码</div>
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="3">
                    <div className="logout" onClick={onLogout}>退出</div>
                  </Menu.Item>
                </Menu>
              }
            >
              <div>{userInfo.name || ''} <DownOutlined className="iconArrowDown"/></div>
            </Dropdown>
          </div>
            {/* 个人信息弹窗 */}
            <Modal title="个人信息" forceRender visible={isModalVisible} onOk={handleSubmit} onCancel={handleCancel} okText="确认" cancelText="取消" >
              <section >
                      <Form  className="infoFormWrap" name="infoForm"  form={form}  labelCol={{span:4}}  size="large"  autoComplete="off" >
                          <Form.Item  label="账号" name="username"   >
                              <Input  placeholder="请输入账号"   disabled/>
                          </Form.Item>
                          <Form.Item  label="昵称" name="name"   
                              rules={[
                                  { 
                                      pattern: /^[\u4e00-\u9fa5]|[a-zA-Z]/, 
                                      message: "昵称可以是字母或者中文"
                                  }
                              ]} >
                              
                              <Input  placeholder="请输入昵称"   />
                          </Form.Item>
                  
                          <Form.Item label="手机号" name="phone" 
                              rules={[ 
                                  {
                                      pattern:/^1[345678]\d{9}$/,
                                      message: "请输入正确的11位手机号"
                                  }
                              ]}>
                              
                              <Input  placeholder="请输入手机号，用于找回密码，选填"    />
                          </Form.Item>
                          <Form.Item label="邮箱" name="email" 
                              rules={[   
                                  {
                                      pattern:/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                                      message: "请输入正确的邮箱格式"
                                  }
                              ]}>
                                  
                              <Input  type="text" placeholder="请输入邮箱，用于找回密码，选填"  />
                          </Form.Item>
                      </Form>
                  </section>
            </Modal>
        </div>
        
      )
}
export default observer(HeadBar);