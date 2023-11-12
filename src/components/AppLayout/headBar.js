/**
 * @Description: 顶部栏
*/
import React, {  useEffect, useState } from 'react';
import { useStore, observer } from '../../hooks/storeHook';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/img/logo.svg';
import { updateUserInfo,updatePassword } from '../../api/login';
import { Form,Input, Dropdown,Modal,Menu,Space,message } from 'antd';
import { DownOutlined,UserOutlined,SettingOutlined,LogoutOutlined} from '@ant-design/icons';
// const {confirm} = Modal;ExclamationCircleOutlined
 
function HeadBar () {
    const { userStore } = useStore()
    const { userInfo } = userStore;
    // 使用useForm创建form实例
    const [form] = Form.useForm();
    const [pwdForm] = Form.useForm();
    const navigate = useNavigate();
    const [infoVisible, setInfoVisible] = useState(false);
    const [resetVisible, setResetVisible] = useState(false);
    const [displayHour,setDisplayHour] = useState(null);
    useEffect(() => {
        if(infoVisible){
            //使用setFieldsValue回显表格数据
            form.setFieldsValue(userInfo)
        }
        // 获取当前时间小时数
        let hour = new Date().getHours();
        // console.log('获取当前时间小时数',hour)
        // 判断当前时间是早上、上午、中午还是下午、傍晚、晚上等
        if (hour > 5 && hour < 10) {
            setDisplayHour("早上好");
        } else if (hour >= 10 && hour < 12) {
            setDisplayHour("上午好");
        } else if (hour >= 12 && hour < 13) {
            setDisplayHour("中午好");
        } else if (hour >= 13 && hour < 17) {
            setDisplayHour("下午好");
        } else if (hour >= 17 && hour < 19) {
            setDisplayHour("傍晚好");
        } else if (hour >= 19 && hour < 23) {
            setDisplayHour("晚上好");
        } else {
            setDisplayHour("夜深了");
        }
    },[form,pwdForm,userInfo,infoVisible,resetVisible])
    // 弹出个人信息页弹框
    function turnToUserInfo() {
        form.resetFields();
        setInfoVisible(true);
    }
    // 个人信息弹窗提交表单数据确认按钮操作,modal异步验证表单项使用async await
    async function handleSubmit() {
        try {
            const values = await form.validateFields();
            // console.log('个人信息',values);
            if (values) {
                let params = {
                    name: values.name,
                    phone: values.phone,
                    email: values.email
                };
                updateUserInfo(params).then((res) => {
                    if (res.data.success === true) {
                        userStore.setUserInfo(res.data.obj);
                        setInfoVisible(false);
                    }
                }).catch((error) => {
                    console.log(error)
                });  
            }
        } catch (error){
            console.log('validate failed',error)
        }
    }
    // 个人信息弹窗取消按钮操作
    function handleCancel() {
        setInfoVisible(false);
    }
    // 弹出重置密码弹窗
    function setPassword() {
        pwdForm.resetFields();
        setResetVisible(true);
    }

    // 重置密码弹窗确定按钮操作
    async function handleResetSubmit() {
        try {
            const values = await pwdForm.validateFields();
            // console.log('重置密码', values)
            if (values) {
                // confirm({
                //     title: '确认重置密码?',
                //     icon: <ExclamationCircleOutlined />,
                //     okText:"确认",
                //     cancelText:"取消",
                //    // confirm弹框内确认按钮操作
                //     onOk() {
                           
                //     },
                // });
                 let params = {
                    newPassword:values.newPwd,
                    repeatPassword:values.repeatPwd,
                };
                updatePassword(params).then((res) => {
                    if(res.data.success === true){
                        message.success(res.data.message);
                        setResetVisible(false);
                    }
                }).catch((error) => {
                    console.log(error)
                })
            }
        } catch (error) {
            console.log('validate failed',error)
        }    
    }
    
    // 重置密码弹窗取消按钮操作
    function handleResetCancel() { 
        setResetVisible(false);
    }
    //   退出登录
    function onLogout () {
        userStore.setToken('');
        userStore.setUserInfo({});
        navigate('/signIn')
    }
    // 解决[antd: Menu] `children` will be removed in next major version. Please use `items` instead问题
    const items = [
        { label:(<Space><UserOutlined/>个人信息</Space>), key: '1',},
        { label:(<Space><SettingOutlined/>修改密码</Space>) , key: '2',},
        { label:(<Space><LogoutOutlined/>退出</Space>), key: '3', },
    ];
    const menuItems = (
        <Menu items={items} onClick={e=>menuItemClick(e)}/>
    );
    
    const menuItemClick = (e) => {
        // console.log('测试', e);
        if (e.key === '1') {
            turnToUserInfo();
        }
        else if (e.key === '2') {
            setPassword()
        } else if (e.key === '3') {
            onLogout();
        }
    }


    return (
    <div className="c-PageLayout-headBar">
        <div className="headLeft">
            {/* logo图标 */}
            <div className="logoWrap"> <img src={logo} className="logo" alt="logo" /></div>
        </div>
        <div className="headRight">
                <Dropdown overlay={menuItems}>
                     {/* overlay={
                        <Menu>
                        <Menu.Item key="0">
                            <div onClick={turnToUserInfo}>个人信息</div>
                        </Menu.Item>
                        <Menu.Item key="1">
                            <div>修改密码</div>
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item key="2">
                            <div className="logout" onClick={onLogout}>退出</div>
                        </Menu.Item>
                        </Menu>
                    } */}
                    <div><span>{ displayHour}，</span>{userInfo.name}<DownOutlined className="iconArrowDown" /></div>
                </Dropdown>
        </div>
        {/* 个人信息弹窗 */}
        <Modal title="个人信息" forceRender visible={infoVisible} onOk={handleSubmit} onCancel={handleCancel} okText="确认" cancelText="取消" >
        <section >
                <Form  className="infoFormWrap" name="infoForm"  form={form}  labelCol={{span:4}}  size="large"  autoComplete="off" >
                    <Form.Item  label="账号" name="username"   >
                        <Input  placeholder="请输入账号"   disabled/>
                    </Form.Item>
                    <Form.Item  label="昵称" name="name"   
                        rules={[
                            { 
                                required: true,
                                pattern: /^[\u4e00-\u9fa5]|[a-zA-Z]/, 
                                message: "昵称可以是字母或者中文"
                            }
                        ]} >
                        
                        <Input  placeholder="请输入昵称"   />
                    </Form.Item>
            
                    <Form.Item label="手机号" name="phone" 
                        rules={[ 
                            {
                                required: true,
                                pattern:/^1[345678]\d{9}$/,
                                message: "请输入正确的11位手机号"
                            }
                        ]}>
                        
                        <Input  placeholder="请输入手机号，用于找回密码，选填"    />
                    </Form.Item>
                    <Form.Item label="邮箱" name="email" 
                        rules={[   
                            {
                                required: true,
                                pattern:/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                                message: "请输入正确的邮箱格式"
                            }
                        ]}>
                            
                        <Input  type="text" placeholder="请输入邮箱，用于找回密码，选填"  />
                    </Form.Item>
                </Form>
            </section>
        </Modal>
        {/* 重置密码弹窗 */}
        <Modal title="重置密码" forceRender visible={resetVisible} onOk={handleResetSubmit} onCancel={handleResetCancel} okText="确认" cancelText="取消" >
            <section >
                <Form  className="infoFormWrap" name="pwdForm"  form={pwdForm} labelCol={{span:6}}  size="large"  autoComplete="off" >
                    <Form.Item  label="新密码：" name="newPwd"   rules={[
                                {required:true,message:'请输入新密码'},
                            ]} >
                        <Input type="password" placeholder="新密码，必填" />
                    </Form.Item>
                    <Form.Item label="确认新密码：" name="repeatPwd"  rules={[
                                {required:true,message:'请再次输入新密码'},    
                                ]} >
                        <Input type="password" placeholder="再次输入新密码，必填"  />
                    </Form.Item>   
                </Form>
            </section>
        </Modal>
    </div>
    )
}
export default observer(HeadBar);