
import React  from 'react';
import {Form,Input,Button} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import {useNavigate} from 'react-router-dom';
import { doSignUp } from '../../api/login';
function SignUp(){
    const [form] = Form.useForm();
    const navigate = useNavigate();
    function handleSubmit(){
        form.validateFields().then(async (values) => {
            // 调用登陆Api，获取结果
            let params = {
                username:values.username,
                password:values.password,
                name:values.name,
                phone:values.phone,
                email:values.email
            };
            let res = await doSignUp(params);
            if(res.data.success=== true){
                // 跳转到主页页面
                navigate('/signIn');
            }
          
        })
       
    }
    // 表单布局
    // {...formItemLayout}
    // const formItemLayout = {
    //     labelCol: {
    //         xs: {
    //           span: 24,
    //         },
    //         sm: {
    //           span: 6,
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
              
            <section className='signUpSection'>
            <h4 className="title">账号注册</h4>
                <Form  className="formWrap" name="login"  form={form} labelCol={{span:4}}  size="large"  autoComplete="off"  >
                    <Form.Item  label="账号" name="username" prefix={<UserOutlined className="site-form-item-icon"/>}  
                        rules={[
                            {
                                required:true,
                                message:'请输入账号'
                            },
                            {
                                pattern: /^[\u4e00-\u9fa5]|[a-zA-Z]/, 
                                message: "用户名可以是字母或者中文"
                            }
                        ]}>
                        <Input  placeholder="请输入账号"/>
                    </Form.Item>
                    <Form.Item  label="昵称" name="name" prefix={<UserOutlined className="site-form-item-icon"/>}  
                        rules={[
                            { 
                                pattern: /^[\u4e00-\u9fa5]|[a-zA-Z]/, 
                                message: "昵称可以是字母或者中文"
                            }
                        ]} >
                        <Input  placeholder="请输入昵称"/>
                    </Form.Item>
                    <Form.Item label="密码" name="password" prefix={<LockOutlined className="site-form-item-icon"/>} 
                        rules={[
                            {
                                required:true, 
                                message:'请输入密码'
                            }       
                        ]}>
                        <Input type="password" placeholder="请输入密码"    />
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
                        <Input placeholder="请输入邮箱，用于找回密码，选填"    />
                    </Form.Item>
                    <Form.Item  >
                        <Button type="primary" className="registerBtn" onClick={handleSubmit}>提交</Button>
                    </Form.Item>
                </Form>
            </section>
        </div>
    )
}
export default SignUp;