import React  from 'react';
import {Form,Input,Button,Checkbox,message} from 'antd';
import {useNavigate, Link} from 'react-router-dom';
// import logo from '../../assets/img/logo.svg';
import '../../assets/style/App.css'
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { doSignIn,getUserInfo } from '../../api/login';
// import store from '../../store';
import { useStore } from '../../hooks/storeHook';


function SignIn(){
    // form实例
    const [form] = Form.useForm();
    // const { userStore } = store;
    const { userStore } = useStore()
    const navigate = useNavigate();

    // url参数
    // const query=getQueryObject();
    // const redirectUrl =  decodeURIComponent(query.redirectUrl || '')

    // enter键事件
    function onkeydown(e){
        console.log(e)
        if(e.nativeEvent.keyCode === 13){
            handleLogin()
        }
    }
    // 登录提交事件
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
                        // console.log(res)
                        if(res.status === 200){
                            let data = res.data.obj;
                            userStore.setUserInfo(data)
                        } 
                    })
                    // 跳转到主页面
                    navigate('/user');  
                    message.success("登录成功");
                }else{
                    message.error("登录失败");
                }
             });
        })
    }
    return(
        <div className="v-signIn-index" >
            {/* <header className="login-header">
               <div className="logoPic"><img src={logo} className="App-logo" alt="logo"></img></div>
            </header> */}
            <section className="signInSection">
                <h4 className="title">个人财务管家系统--流水集</h4>
                <Form  className="formWrap" name="login"  form={form}  size="large"  autoComplete="off"   initialValues={{ remember: true, }} >
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
                        <Input type="password" placeholder="请输入密码"    onKeyDown={(e)=>onkeydown(e)}  />
                    </Form.Item>
                    <Form.Item  >
                        <div className="moreWrap">
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                        </div>
                    </Form.Item>
                    <Form.Item  >
                        <Button type="primary" className="loginBtn" onClick={handleLogin}  > 登录</Button>
                        Or <Link to="/signUp">register now!</Link>
                    </Form.Item>
                </Form>
            </section>
        </div>
    )
}
export default SignIn;