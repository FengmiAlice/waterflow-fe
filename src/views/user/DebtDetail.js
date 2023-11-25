import React, {} from 'react';//useState
import { useLocation,useSearchParams } from 'react-router-dom';

function DebtDetail() {
    //  const [params,setParams]=useSearchParams();
    // console.log('获取searchParams传递的参数',params.get("row"))
    let location = useLocation();//获取navaigate中传递的state信息
    // console.log('navaigate中传递的params', location);
   
   
    return (
        <div>欢迎查看债务记录详情页面,{ location.state.rowParam}</div>
    )
 }
export default DebtDetail;
