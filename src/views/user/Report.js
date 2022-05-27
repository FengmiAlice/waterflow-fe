

import React, {useEffect,useState,useRef} from 'react';
import { DatePicker,Form,Button,Statistic  } from 'antd';
import ArgPieEcharts from '../../components/Echarts/pie';
import ArgBarEcharts from '../../components/Echarts/bar'
import {getOverview,getConsumePie,getConsumePieType,getIncome,getConsumeIncomeLately} from '../../api/report';
import '../../assets/style/App.css';

function Report(){
     // 搜索条件的一些参数获取
    const month = useRef();//设置月份
    const year = useRef();//设置年份  
    const [consumeAcount,setConsumeAcount] = useState(0);
    const [incomeAcount,setIncomeAcount] =useState(0);
    const [wealthAcount,setWealthAcount] =useState(0);
  
    const [pieData,setPieData] = useState([]);  // 设置获取各类开支占比饼图数据
    const [pieTypeData,setPieTypeData] =useState([]); // 设置获取各类支付方式占比饼图数据
    const [incomeData,setIncomeData] =useState([]);  // 设置获取各类收入占比饼图数据

    const [barTitle,setBarTitle] = useState('');//柱状图title
    const [barXData,setBarXData] = useState([]);//柱状图x轴数据
    const [barData,setBarData] = useState([]);//柱状图series数据
    const [lenData,setLenData] = useState([]);//柱状图legend数据


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
            setIncomeData(res.data)
          
        })
    }
    
      // 获取最近半年收支情况数据
      function getLaterlyBarData(){
        getConsumeIncomeLately().then((res)=>{
            setBarTitle(res.data.title);
            setLenData(res.data.nameArray);
            setBarXData(res.data.xdataArray);
          
            let seriesArray = [];
            let nameArray = res.data.nameArray;
            let yDataArray= res.data.ydataArray;
            for (var index = 0; index < nameArray.length; index ++) {
                var seriesData = {
                    type: 'bar',
                    name: nameArray[index],
                    data: yDataArray[index]
                };
                seriesArray.push(seriesData);
            }
            setBarData(seriesArray)
          
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
        getIncomeData();
        getLaterlyBarData();
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
           <div className='barContainer'>
                <div className='echartsBarItem'>
                    <ArgBarEcharts id="IncomeLatelyBar" title={barTitle} xData={barXData} seriesData={barData} legendData={lenData} /> 
                </div>
           </div>
       
        </section>
    </div>
    )
}
export default Report;