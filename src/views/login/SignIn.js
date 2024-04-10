import React,{useEffect}  from 'react';
import {Form,Input,Button} from 'antd';
import {useNavigate, Link} from 'react-router-dom';
import '../../assets/style/App.css'
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { doSignIn,getUserInfo } from '../../api/login';
import { useStore } from '../../hooks/storeHook';

function SignIn(){
    // 创建form实例
    const [form] = Form.useForm();
    // const { userStore } = store;
    const { userStore } = useStore()
    const navigate = useNavigate();

    useEffect(()=>{

    },[])

    // enter键事件
    function onkeydown(e){
        if(e.nativeEvent.keyCode === 13){
            handleLogin()
        }
    }
    
    // 登录提交事件
     function handleLogin(){
        form.validateFields().then( (values) => {
            let params = {username:values.username,password:values.password};
             doSignIn(params).then((res)=>{
                if(res.data.success=== true){
                    //  登录成功后重新获取token
                    const token = res.headers.authorization;
                    userStore.setToken(token);
                    
                    // 登录之后获取用户信息
                    getUserInfo().then((res) => {
                        if(res.data.success === true){
                            let data = res.data.obj;
                            userStore.setUserInfo(data)
                        } 
                    }).catch((error)=>{
                        console.log(error)
                    })
                    // 跳转到主页面
                    navigate('/index/consume');  
                }
             }).catch((error)=>{
                console.log(error)
            });
        }).catch((error)=>{
            console.log(error)
        })
    }

    return(
        <div className="v-signIn-index" >
            <section className="signInSection">
                <h4 className="title">个人财务管家系统--流水集</h4>
                <Form  className="formWrap" name="login"  form={form}  size="large"  autoComplete="on"  >
                    <Form.Item   name="username"  
                        rules={[
                                    {required:true,message:'请输入账号'},
                                    
                                ]}
                        >
                        <Input prefix={<UserOutlined className="prefix-icon" />} type="text" placeholder="请输入账号"   />
                    </Form.Item>
                    <Form.Item  name="password" 
                        rules={[
                                    {required:true,message:'请输入密码'},
                                    
                                ]}
                        >
                        <Input prefix={<LockOutlined className="prefix-icon" />} type="password" placeholder="请输入密码"  onKeyDown={(e)=>onkeydown(e)}  />
                    </Form.Item>
                    <Form.Item  >
                        <Button type="primary" className="loginBtn" onClick={handleLogin}  > 登录</Button>
                        或者 <Link to="/signUp">注册</Link>
                    </Form.Item>
                </Form>
            </section>
        </div>
    )
}
export default SignIn;