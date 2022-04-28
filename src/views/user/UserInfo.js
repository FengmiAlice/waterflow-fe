import React  from 'react';
import {Form,Input,Button,message} from 'antd';
import { UserOutlined, LockOutlined,ExclamationCircleOutlined } from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import { updateUserInfo } from '../../api/login';
import { useStore } from '../../hooks/storeHook';
import { Modal} from 'antd'
const {confirm} = Modal;
function UserInfo(){


    const { userStore } = useStore()
const { userInfo } = userStore;
    const [form] = Form.useForm();

    const navigate = useNavigate();
    function handleSubmit(){
        confirm({
            title: '确认修改?',
            icon: <ExclamationCircleOutlined />,
            content: 'When clicked the OK button, this dialog will be closed after 1 second',
            onOk() {
                form.validateFields().then(async (values) => {
                    // console.log(values)
                    // 调用登陆Api，获取结果
                    let params = {
                        username:userInfo.username,
                        name:values.name,
                        phone:values.phone,
                        email:values.email
                    };
                    let res = await updateUserInfo(params);
                    // console.log(res)
                    if(res.status === 200){
                        message.success(res.data.message);
                        // 跳转到主页页面
                        navigate('/user');
                    }else{
                        message.error(res.data.message)
                    }
                })
            },
            onCancel() {
                console.log('Cancel');
            },
          });

       
    }
    const formItemLayout = {
        labelCol: {
            xs: {
              span: 24,
            },
            sm: {
              span: 8,
            },
          },
          wrapperCol: {
            xs: {
              span: 24,
            },
            sm: {
              span: 16,
            },
          },
    };
    
    return(
        <div className="v-signUp-index" >   
                <h4 className="title">个人信息</h4>
            <section >
                <Form  className="formWrap" name="login"  form={form} {...formItemLayout}  size="large"  autoComplete="off"  >

                    <Form.Item  label="账号" name="username" prefix={<UserOutlined className="site-form-item-icon"/>}  >
                        <Input  placeholder="请输入账号" readOnly value={userInfo.username} />
                    </Form.Item>
                    <Form.Item  label="昵称" name="name" prefix={<UserOutlined className="site-form-item-icon"/>}  
                        rules={[
                            { 
                                pattern: /^[\u4e00-\u9fa5]|[a-zA-Z]/, 
                                message: "昵称可以是字母或者中文"
                            }
                        ]} >
                        <Input  placeholder="请输入昵称" value={userInfo.name} />
                    </Form.Item>
            
                    <Form.Item label="手机号" name="phone" prefix={<LockOutlined className="site-form-item-icon"/>} 
                        rules={[ 
                            {
                                 pattern:/^1[345678]\d{9}$/,
                                 message: "请输入正确的11位手机号"
                            }
                        ]}>
                        <Input  placeholder="请输入手机号，用于找回密码，选填"  value={userInfo.phone}  />
                    </Form.Item>
                    <Form.Item label="邮箱" name="email"  prefix={<LockOutlined className="site-form-item-icon"/>} 
                        rules={[   
                            {
                                pattern:/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                                message: "请输入正确的邮箱格式"
                            }
                        ]}>
                        <Input placeholder="请输入邮箱，用于找回密码，选填"  value={userInfo.email}  />
                    </Form.Item>
                    <Form.Item  >
                        <Button type="primary" className="loginBtn" onClick={handleSubmit}>确认修改信息，提交</Button>
                    </Form.Item>
                </Form>
            </section>
        </div>
    )
}
export default UserInfo;