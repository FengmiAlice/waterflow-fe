import React  from 'react';
import {Form,Input,Button} from 'antd';
import { UserOutlined, LockOutlined,ExclamationCircleOutlined } from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import { updateUserInfo } from '../../api/login';
import { useStore } from '../../hooks/storeHook';
import '../../assets/style/App.css'
import { Modal} from 'antd';
const {confirm} = Modal;

function UserInfo(){
    const { userStore } = useStore()
    const { userInfo } = userStore;
    // 使用useForm setFieldsValue回显表格数据
    const [form] = Form.useForm();
    form.setFieldsValue(userInfo)

    const navigate = useNavigate();
    // 提交表单数据
    function handleSubmit(){
        confirm({
            title: '确认修改?',
            icon: <ExclamationCircleOutlined />,
            okText:"确定",
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
            // 取消按钮操作
            // onCancel() {
            //     console.log('Cancel');
            // },
          });
    }
    // 返回上一页
    function handleBack(){
         // 跳转到主页页面
         navigate('/index/user');
    }
    // const formItemLayout = {
    //     labelCol: {
    //         xs: {
    //           span: 16,
    //         },
    //         sm: {
    //           span: 8,
    //         },
    //       },
    //       wrapperCol: {
    //         xs: {
    //           span: 24,
    //         },
    //         sm: {
    //           span: 16,
    //         },
    //       },
    // };
    return(
        <div className="v-signUp-index" >   
                <h4 className="title">个人信息</h4>
            <section >
                <Form  className="formWrap  infoFormWrap" name="login"  form={form}   size="large"  autoComplete="off" >
                    <Form.Item  label="账号" name="username" prefix={<UserOutlined className="site-form-item-icon"/>}  >
                        <Input  placeholder="请输入账号"   disabled/>
                    </Form.Item>
                    <Form.Item  label="昵称" name="name" prefix={<UserOutlined className="site-form-item-icon"/>}  
                        rules={[
                            { 
                                pattern: /^[\u4e00-\u9fa5]|[a-zA-Z]/, 
                                message: "昵称可以是字母或者中文"
                            }
                        ]} >
                        
                        <Input  placeholder="请输入昵称"   />
                    </Form.Item>
            
                    <Form.Item label="手机号" name="phone" prefix={<LockOutlined className="site-form-item-icon"/>} 
                        rules={[ 
                            {
                                 pattern:/^1[345678]\d{9}$/,
                                 message: "请输入正确的11位手机号"
                            }
                        ]}>
                        
                        <Input  placeholder="请输入手机号，用于找回密码，选填"    />
                    </Form.Item>
                    <Form.Item label="邮箱" name="email"  prefix={<LockOutlined className="site-form-item-icon"/>} 
                        rules={[   
                            {
                                pattern:/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                                message: "请输入正确的邮箱格式"
                            }
                        ]}>
                            
                        <Input  type="text" placeholder="请输入邮箱，用于找回密码，选填"  />
                    </Form.Item>
                    <Form.Item  >
                        <Button type="primary" className="userInfoBtn" onClick={handleSubmit}>提交</Button>
                        <Button type="primary" className="backBtn" onClick={handleBack}>返回</Button>
                    </Form.Item>
                </Form>
            </section>
        </div>
    )
}
export default UserInfo;