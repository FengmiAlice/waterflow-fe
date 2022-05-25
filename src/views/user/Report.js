

import React, {useEffect,useState,useRef} from 'react';
import { DatePicker,Form,Button,Col, Row, Statistic  } from 'antd';
import {getOverview} from '../../api/report';
import '../../assets/style/App.css';
function Report(){
     // 搜索条件的一些参数获取
    const month = useRef();//设置月份
    const year = useRef();//设置年份  
    const [consumeAcount,setConsumeAcount] = useState(0);
    const [incomeAcount,setIncomeAcount] =useState(0);
    const [wealthAcount,setWealthAcount] =useState(0);
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
        buttonSearch()
    },[])

    function buttonSearch(){
        let params={
            month:month.current,
            year:year.current,
        }
        getOverview(params).then((res)=>{
            console.log(res)
            if(res.data.success === true){
                setConsumeAcount(res.data.obj.totalConsume);
                setIncomeAcount(res.data.obj.totalIncome);
                setWealthAcount(res.data.obj.totalWealth);
            }
        })
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
            <div className='leftStatistics'>
                  
                        <Statistic  className='titleCenter' title="支出" value={consumeAcount} />
                    
                    
                        <Statistic  className='titleCenter' title="收入" value={incomeAcount} />
                    
                    
                        <Statistic  className='titleCenter' title="余额" value={wealthAcount} />
                   
              
            </div>
            <div className='rightStatistics'>

            </div>
       
        </section>
    </div>
    )
}
export default Report;