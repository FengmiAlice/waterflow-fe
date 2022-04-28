import React  from 'react';
import {Form,Input,Button,Checkbox,message} from 'antd';
import {useNavigate, Link} from 'react-router-dom';
import logo from '../../logo.svg';
import '../../App.css'
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { doSignIn,getUserInfo } from '../../api/login';
import store from '../../store';



function SignIn(){
    // form实例
    const [form] = Form.useForm();
    const { userStore } = store;
    const navigate = useNavigate();

    // url参数
    // const query=getQueryObject();
    // const redirectUrl =  decodeURIComponent(query.redirectUrl || '')

     function handleLogin(){
        form.validateFields().then( (values) => {
            // console.log(values)
            // 调用登陆Api，获取结果
            let params = {username:values.username,password:values.password};
             doSignIn(params).then((res)=>{
            //  console.log(res)
                if(res.status=== 200){
                    //  登录成功后重新获取token
                    const token = res.headers.authorization;
                    userStore.setToken(token);
                    
                    // 登录之后获取用户信息
                    getUserInfo().then((res) => {
                        console.log(res)
                        let data = res.data.obj
                        userStore.setUserInfo(data)
                       
                    })

                    navigate('/user');  // 跳转到主页面
                    message.success("登录成功");
                }else{
                    message.error("登录失败");
                }
             });
        })
    }
    return(
        <div className="v-signIn-index" >
            <header className="login-header">
                <div className="logoPic"><img src={logo} className="App-logo" alt="logo"></img></div>
                <h4 className="title">个人财务管家系统--流水集</h4>
            </header>
           
            <section >
                <Form  className="formWrap" name="login"  form={form}  size="large"  autoComplete="off"  >
                    <Form.Item  label="账号" name="username"  prefix={<UserOutlined className="site-form-item-icon"/>}  
                        rules={[
                                    {required:true,message:'请输入账号'},
                                    
                                ]}
                        >
                        <Input type="text" placeholder="请输入账号"/>
                    </Form.Item>
                    <Form.Item label="密码" name="password"  prefix={<LockOutlined className="site-form-item-icon"/>} 
                        rules={[
                                    {required:true,message:'请输入密码'},
                                    
                                ]}
                        >
                        <Input type="password" placeholder="请输入密码"    />
                    </Form.Item>
                    <Form.Item  >
                        <div className="moreWrap">
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>
                      
                        </div>
                    </Form.Item>
                    <Form.Item  >
                        <Button type="primary" className="loginBtn" onClick={handleLogin}>登录</Button>
                        Or <Link to="/signUp">register now!</Link>
                    </Form.Item>
                </Form>
            </section>
        </div>
    )
}
export default SignIn;