import React, {} from 'react';//useState
import { useLocation } from 'react-router-dom';

function DebtDetail() {

    let location = useLocation();//获取当前路由信息
    let user=location.state.row;
    // console.log('获取路由参数',user);
    return (
        <div>欢迎查看债务记录详情页面{ user.id}</div>
    )
 }
export default DebtDetail;
