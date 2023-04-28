

import React, {useEffect,useState,useRef, useCallback} from 'react';
import { DatePicker,Form,Button,Statistic,Select, message  } from 'antd';
import AsyncModal from '../../components/Modal';
import ArgPieEcharts from '../../components/Echarts/pie';
import ArgBarEcharts from '../../components/Echarts/bar';
import ArgLineEcharts from '../../components/Echarts/line';
import {getOverview,getConsumePie,getConsumePieType,getIncome,getConsumeIncomeLately,getThreeConsumeLately,getLineConsumeData} from '../../api/report';
import moment from 'moment';
const { Option } = Select;

function Report(){
     // 搜索条件的一些参数获取
    const month = useRef();//设置月份
    const year = useRef();//设置年份  

    // const reportFooter = useState(false);
    const [isModalType,setIsModalType] = useState('');//设置弹窗输出类型
    const [reportVisible,setReportVisble] = useState(false);//设置详细报告弹窗false
    const [reportTitle,setReportTitle] = useState('');//设置详细报告弹窗title
    const [reportText,setReportText] = useState('');//设置详细报告弹窗text


    const [consumeAcount,setConsumeAcount] = useState(0);
    const [incomeAcount,setIncomeAcount] =useState(0);
    const [wealthAcount,setWealthAcount] =useState(0);
  
    const [pieData,setPieData] = useState([]);  // 设置获取各类开支占比饼图数据
    const [pieTypeData,setPieTypeData] =useState([]); // 设置获取各类支付方式占比饼图数据
    const [incomeData,setIncomeData] =useState([]);  // 设置获取各类收入占比饼图数据

    const [barTitle,setBarTitle] = useState('');//最近半年收支柱状图title
    const [barXData,setBarXData] = useState([]);//最近半年收支柱状图x轴数据
    const [barData,setBarData] = useState([]);//最近半年收支柱状图series数据
   

    const [multipleBarTitle,setMultipleBarTitle] = useState(''); //最近3个月支出柱状图title
    const [multipleBarLenData,setMultipleBarLenData] = useState([]); //最近3个月支出柱状图legend数据
    const [multipleBarXData,setMultipleBarXData] = useState([]); //最近3个月支出柱状图x轴数据
    const [multipleBarData,setMultipleBarData] = useState([]);  //最近3个月支出柱状图series数据

    const [lineTitle, setLineTitle] = useState('');//支出收入折线图title
    const [lineData, setLineData] = useState([]);//支出收入折线图表数据
    const [lineXData,setLineXData] =useState([]);//支出收入折线图x轴数据
    const [lineLenData,setLineLenData] = useState([]);//支出收入折线图例数据

    const [lineForm] = Form.useForm();
    const startDate = useRef('');//开始日期
    const endDate = useRef('');//结束日期
    const statisticType = useRef('1');//统计粒度
    const selectedTypeArray=[
        {
            key:'0',
            name:'天'
        },
        {
            key:'1',
            name:'月'
        },
        {
            key:'2',
            name:'年'
        }
        ];
    //  获取月份日期值
     function getMonthChange(date,dateString){
         month.current = dateString
     }
    //  获取年份日期值
    const getYearChange = (date,dateString)=>{
        year.current = dateString
    }

    // 获取折线图搜索开始日期
    const getStartDateChange=(date,dateString)=>{
        let startVal = moment(date).valueOf();
        let endVal= new Date(endDate.current).getTime();
        if(startVal > endVal){
            lineForm.setFieldsValue({startField:null});
            startDate.current = "";
            message.info('请选择小于结束日期的开始日期');
            return; 
        }
        startDate.current = dateString;
    }
     // 获取折线图搜索结束日期
     const getEndDateChange=(date,dateString)=>{  
        let startVal= new Date(startDate.current).getTime();
        let endVal = moment(date).valueOf();
       if(endVal < startVal){
            lineForm.setFieldsValue({endField:null});
            endDate.current = '';
            message.info('请选择大于开始日期的结束日期');
            return;
       }
        endDate.current = dateString;
       
    }
 
    // 获取统计粒度
    const countChange=(value)=>{
        if(value === null || value === undefined){
            statisticType.current = '';
        }else{
            statisticType.current = value;
        }
    }
    //各类收入开支饼图柱状图搜索按钮事件
    const buttonSearch = useCallback(
        (params={
            month:month.current,
            year:year.current,
        })=>{
       
        getOverview(params).then((res)=>{
            if(res.data.success === true){
                setConsumeAcount(res.data.obj.totalConsume);
                setIncomeAcount(res.data.obj.totalIncome);
                setWealthAcount(res.data.obj.totalWealth);
                setReportTitle(res.data.obj.report.title);
                setReportText(res.data.obj.report.text);
            }
        })
        getConsumePieData();
        getConsumePieTypeData();
        getIncomeData();
    },[])

    useEffect(()=>{
        // 设置支出收入余额搜索参数默认值
        let forwardYear = moment().subtract(1, 'year').format('YYYY-MM-DD');
        startDate.current = forwardYear;
        endDate.current = moment().format("YYYY-MM-DD");//格式化当前日期

        buttonSearch();
        buttonLineSearch();
        getLaterlyBarData();
        getThreeConsumeData();
      
    },[buttonSearch])
    
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
            let seriesArray = [];
            let title = res.data.title;
            let barSeriesX= res.data.xdataArray
            let nameArray = res.data.nameArray;
            let yDataArray= res.data.ydataArray;
            setBarTitle(title);
            setBarXData(barSeriesX);
            for (var index = 0; index < nameArray.length; index ++) {
                var seriesData = {
                    type: 'bar',
                    name: nameArray[index],
                    data: yDataArray[index]
                };
                seriesArray.push(seriesData);
            }
            setBarData(seriesArray);
    
        })
    }
    // 获取最近三个月支出情况数据
    function getThreeConsumeData(){
        getThreeConsumeLately().then((res)=>{
            let seriesArray = [];
            let title = res.data.title;
            let sereiesX = res.data.xdataArray;
            let nameArray = res.data.nameArray;
            let yDataArray= res.data.ydataArray;
            setMultipleBarTitle(title);
            setMultipleBarXData(sereiesX);
            setMultipleBarLenData(nameArray);
            for (var index = 0; index < nameArray.length; index ++) {
                // 总计列不需要堆叠
                if (index === 0) {
                    var seriesData1 = {
                        type: 'bar',
                        name: nameArray[index],
                        label: {
                            normal: {
                                show: true,
                                textBorderColor: '#333',
                                textBorderWidth: 2
                            }
                        },
                        data: yDataArray[index]
                    };
                    seriesArray.push(seriesData1);
                } else {
                    var stackData = {
                        type: 'bar',
                        name: nameArray[index],
                        stack: nameArray[0],
                        data: yDataArray[index]
                    };
                    seriesArray.push(stackData);
                }
            }
            setMultipleBarData(seriesArray);
        })
    }

    // 支出收入余额折线图搜索按钮
    function buttonLineSearch(){
        let params={
            startDate:startDate.current,
            endDate:endDate.current,
            statisticType:statisticType.current
        }
        getLineConsumeData(params).then((res)=>{
            let seriesArray=[];
            let title = res.data.title;
            let seriesLineX = res.data.xdataArray;
            let nameArray = res.data.nameArray;
            let yDataArray = res.data.ydataArray;
        
            setLineTitle(title);
            setLineLenData(nameArray);
            setLineXData(seriesLineX);
            for(let i=0;i<nameArray.length;i++){
                let stackData={
                    name:nameArray[i],
                    type: 'line',
                    data:yDataArray[i],
                    areaStyle: {
            
                    },
                }
                seriesArray.push(stackData)
            }
            setLineData(seriesArray);
        })
    }
    // 点击查看详细报告按钮事件
    function detailReport(){
        setIsModalType('special');
        operFunc(true)
    }
    // 设置详细报告弹窗是否显示
    const operFunc = (flag)=>{
        setReportVisble(flag)
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
                        <Button type="primary" className="searchBtn" onClick={detailReport}> 详细报告</Button>
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
                    <ArgBarEcharts id="IncomeLatelyBar" title={barTitle} xData={barXData} seriesData={barData}  barType="single" /> 
                </div>
                <div className='echartsBarItem'>
                    <ArgBarEcharts id="IncomeLatelyThreeBar" title={multipleBarTitle} xData={multipleBarXData} legendData={multipleBarLenData} seriesData={multipleBarData} barType="stackMultiple" /> 
                </div>
           </div>
           <div className="lineContiner">
                <Form  className="reportWrap" layout="inline" name="Report"  size="small" form={lineForm}  
                //设置初始值
                initialValues={{'startField':moment().subtract(1, 'year'),'endField':moment(),'countNum':statisticType.current}}>
                        <Form.Item label="开始日期" name="startField" >
                            <DatePicker format='YYYY-MM-DD'   onChange={getStartDateChange} />
                            {/* defaultValue={moment().subtract(1, 'year')} */}
                        </Form.Item>
                        <Form.Item label="结束日期" name="endField">
                            <DatePicker format='YYYY-MM-DD'  onChange={getEndDateChange} />
                            {/* defaultValue={moment()}  */}
                        </Form.Item>
                        <Form.Item  >
                        <Form.Item label="统计粒度" name="countNum">
                            <Select style={{ width: 120 }}  onChange={countChange} allowClear={true}>
                                    {
                                        selectedTypeArray.map( (item,index,arr) => (
                                            <Option key={item.key} value={item.key}>
                                                {item.name}
                                            </Option>
                                        ))
                                    }
                            </Select>
                            {/* defaultValue={statisticType.current} */}
                        </Form.Item>
                        </Form.Item>
                        <Form.Item  >
                            <Button type="primary" className="searchBtn" onClick={buttonLineSearch} > 搜索</Button>
                        </Form.Item>
                    
                </Form>
                <div className='echartsLineItem'>
                    <ArgLineEcharts id="multipleLine" title={lineTitle} legendData={lineLenData} xData={lineXData} seriesData={lineData} />
                </div>
               
           </div>
       
        </section>
        <AsyncModal   className="reportDialog" title={reportTitle}  vis={reportVisible}  modalType={isModalType} isClosable={false}  isFooter={null}  operDialogFunc={operFunc}>
            <p>{reportText}</p>
        </AsyncModal>

        {/* <Modal
            className="reportDialog"
            title={reportTitle}
            visible={reportVisible}
            onCancel={handleClose}
            closable = {false}
            footer={null}
        >
            <p>{reportText}</p>
        </Modal> */}
    </div>
    )
}
export default Report;