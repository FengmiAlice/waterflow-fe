

import React, {useEffect,useState,useRef} from 'react';
import { DatePicker,Form,Button,Statistic  } from 'antd';
import ArgPieEcharts from '../../components/Echarts/pie';
import {getOverview,getConsumePie,getConsumePieType,getIncome} from '../../api/report';
import '../../assets/style/App.css';

function Report(){
     // 搜索条件的一些参数获取
    const month = useRef();//设置月份
    const year = useRef();//设置年份  
    const [consumeAcount,setConsumeAcount] = useState(0);
    const [incomeAcount,setIncomeAcount] =useState(0);
    const [wealthAcount,setWealthAcount] =useState(0);
    // 设置获取各类开支占比饼图数据
    const [pieData,setPieData] = useState([]);
    const [pieTypeData,setPieTypeData] =useState([]);
    const [incomeData,setIncomeData] =useState([]);
    //  获取月份日期值
     function getMonthChange(date,dateString){
         console.log(date)
         console.log(dateString)
         month.current = dateString
     }
    //  获取年份日期值
    const getYearChange = (date,dateString)=>{
        year.current = dateString
    }

    useEffect(()=>{
        buttonSearch();
      
    },[])
    
    // 获取各类开支占比图数据
    function getConsumePieData(){
        let params={
            month:month.current,
            year:year.current,
        }
        getConsumePie(params).then((res)=>{
            // console.log(res)
            setPieData(res.data)
          
        })
    }
     // 获取各类支付方式占比图数据
    function getConsumePieTypeData(){
        let params={
            month:month.current,
            year:year.current,
        }
        getConsumePieType(params).then((res)=>{
            // console.log(res)
            setPieTypeData(res.data)
          
        })
    }
    // 获取各类收入占比图数据
    function getIncomeData(){
        let params={
            month:month.current,
            year:year.current,
        }
        getIncome(params).then((res)=>{
            // console.log(res)
            setIncomeData(res.data)
          
        })
    }
    
    //搜索按钮事件
    function buttonSearch(){
        let params={
            month:month.current,
            year:year.current,
        }
        getOverview(params).then((res)=>{
            if(res.data.success === true){
                setConsumeAcount(res.data.obj.totalConsume);
                setIncomeAcount(res.data.obj.totalIncome);
                setWealthAcount(res.data.obj.totalWealth);
            }
        })

        getConsumePieData();
        getConsumePieTypeData();
        getIncomeData()
    }

    return(
    <div>
        <header className='searchFormHeader'>
            <Form  className="reportWrap" layout="inline" name="Report"  size="small"  >
                    <Form.Item label="月份选择"  >
                        <DatePicker format='YYYY-MM' picker="month" onChange={getMonthChange} />
                    </Form.Item>
                    <Form.Item label="年份选择" >
                        <DatePicker format='YYYY'    picker="year"  onChange={getYearChange} />
                    </Form.Item>
                   
                    <Form.Item  >
                        <Button type="primary" className="searchBtn" onClick={buttonSearch} > 搜索</Button>
                    </Form.Item>
                    <Form.Item  >
                        <Button type="primary" className="searchBtn" > 详细报告</Button>
                    </Form.Item>
            </Form>
           
        </header>
        <section>
           
            <div className="pieContainer">
                <div className='leftStatistics'>
                    <Statistic  className='titleCenter' title="支出" value={consumeAcount} />
                    <Statistic  className='titleCenter' title="收入" value={incomeAcount} />
                    <Statistic  className='titleCenter' title="余额" value={wealthAcount} />
                </div>
                 {/* 饼图显示 */}
                <div className='rightStatistics'>
                    <div className='echartsPieItem'>
                        <ArgPieEcharts id="consumePie" title="各类开支占比图" sourceData={pieData} />
                    </div>
                    <div className='echartsPieItem'>
                        <ArgPieEcharts id="consumeTypePie" title="各类支付方式占比图" sourceData={pieTypeData} />
                    </div>
                    <div className='echartsPieItem'>
                         <ArgPieEcharts id="incomePie" title="各类收入占比图" sourceData={incomeData} />
                    </div>
                  
                </div>
            </div>
           
       
        </section>
    </div>
    )
}
export default Report;