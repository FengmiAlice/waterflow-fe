
import React, { useEffect, useState } from 'react';
import ArgPieEcharts from '../../../components/Echarts/pie';
import { typePieAccount } from '../../../api/user';

function AccountReport() {

     useEffect(()=>{
         getPieAccounts();//获取账户占比饼图数据
    },[])
    const [pieData, setPieData] = useState([]); // 设置账户占比饼图数据

      // 获取账户内账户占比饼图数据
    function getPieAccounts(){
        let params={}
        typePieAccount(params).then((res) => {
            // console.log('账户余额',res)
            setPieData(res.data)
        }).catch((error)=>{
            console.log(error)
        })
    }
    return (
        <div className="accountReportContainer">
            <div className='echartsPieItem'>
                <ArgPieEcharts id="accountPie" title="各类财富余额占比图" sourceData={pieData} />
            </div>
        </div>
    )
     
 }
export default AccountReport;