

import React, {useEffect,useState,useRef} from 'react';
import { DatePicker,Form,Input,Button,Statistic,Select, message  } from 'antd';
import AsyncModal from '../../../components/Modal';
import ArgPieEcharts from '../../../components/Echarts/pie';
import ArgBarEcharts from '../../../components/Echarts/bar';
import ArgLineEcharts from '../../../components/Echarts/line';
import {getOverview,getConsumePie,getConsumePieType,getIncome,getConsumeIncomeLately,getThreeConsumeLately,getLineConsumeData,createGraph,getGraphList,executeGraphById,deleteGraphById} from '../../../api/report';
import { debounce } from '../../../utils/appTools';
import { useNavigate } from 'react-router-dom';
import {DeleteOutlined,EditOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';
const { Option } = Select;


function Report(){
     // 搜索条件的一些参数获取
    const month = useRef('');//设置月份
    const year = useRef('');//设置年份  
    const navigate = useNavigate();

    // const reportFooter = useState(false);
    const [isModalType,setIsModalType] = useState('');//设置弹窗输出类型
    const [reportVisible,setReportVisble] = useState(false);//设置详细报告弹窗false
    const [reportTitle,setReportTitle] = useState('');//设置详细报告弹窗title
    const [reportText, setReportText] = useState('');//设置详细报告弹窗text
    const [customVisible, setCustomVisible] = useState(false);//设置自定义图表弹窗false

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
    const [chartWords, setChartWords] = useState(''); //自定义图表关键词
    

    const [customGraphArray,setCustomGraphArray] = useState([]); //自定义图表数据
    // const [customBarTitle,setCustomBarTitle] = useState(''); //自定义柱状图title
    // const [customBarXData,setCustomBarXData] = useState([]); //自定义柱状图x轴数据
    // const [customBarSeriesData,setCustomBarSeriesData] = useState([]); //自定义柱状图series数据
    // const [customPieTitle, setCustomPieTitle] = useState(''); //自定义饼图title
    // const [customPieSeriesData, setCustomPieSeriesData] = useState([]); //自定义饼图series数据
    // const [customLineSereiesData, setCustomLineSereiesData] = useState([]); //自定义折线图series数据
    // const [customLineXData, setCustomLineXData] = useState([]); //自定义折线图x轴数据
    // const [customLineTitle, setCustomLineTitle] = useState(''); //自定义折线图title
    // const [customLineLegendData, setCustomLineLegendData] = useState([]); //自定义折线图legend数据

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
    function getMonthChange(date, dateString) {
          // 非空判断
        dateString =dateString || '';
         month.current = dateString
     }
    //  获取年份日期值
    const getYearChange = (date, dateString) => {
         // 非空判断
        dateString =dateString || '';
        year.current = dateString
    }

    // 获取折线图搜索开始日期
    const getStartDateChange=(date,dateString)=>{
        let startVal = dayjs(date).valueOf();
        let endVal= new Date(endDate.current).getTime();
        if(startVal > endVal){
            lineForm.setFieldsValue({'startField':null});
            startDate.current = "";
            message.info('请选择小于结束日期的开始日期');
            return; 
        }
        startDate.current = dateString;
    }
     // 获取折线图搜索结束日期
     const getEndDateChange=(date,dateString)=>{  
        let startVal= new Date(startDate.current).getTime();
        let endVal = dayjs(date).valueOf();
       if(endVal < startVal){
            lineForm.setFieldsValue({'endField':null});
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

    useEffect(()=>{
        // 设置支出收入余额搜索参数默认值
        let forwardYear = dayjs().subtract(1, 'year').format('YYYY-MM-DD');//开始日期与结束日期相差1年
        startDate.current = forwardYear;
        endDate.current = dayjs().format("YYYY-MM-DD");//结束日期
        
        buttonLineSearch();
        getLaterlyBarData();
        getThreeConsumeData();
        // 初始化调用buttonSearch内的各个函数，给各类收入、各类开支、各类支付方式饼图，概览数据赋值
        getReportAccount();
        getConsumePieData();
        getConsumePieTypeData();
        getIncomeData();
        fetchCustomGraphsData();
       
    },[])
    
   // 设置搜索防抖功能
    const debounceReportSearch = debounce(buttonSearch,1000);
    // 各类收入、各类开支、各类支付方式饼图搜索按钮事件
    function buttonSearch() {
        getReportAccount();
        getConsumePieData();
        getConsumePieTypeData();
        getIncomeData();
    }
    // 获取顶部概览填充数据
    function getReportAccount() {
        let params={
            month:month.current,
            year:year.current,
        }
        getOverview(params).then((res)=>{
            if(res.data.success === true){
                setConsumeAcount(res.data.obj.totalConsume);
                setIncomeAcount(res.data.obj.totalIncome);
                setWealthAcount(res.data.obj.totalWealth);
                setReportTitle(res.data.obj.report.title);
                setReportText(res.data.obj.report.text);
            }
        }).catch((error)=>{
            console.log(error)
        })
    }
    // 获取各类开支占比图数据
    function getConsumePieData(){
        let params={
            month:month.current,
            year:year.current,
        }
        getConsumePie(params).then((res)=>{
            setPieData(res.data)
        }).catch((error)=>{
            console.log(error)
        })
    }
     // 获取各类支付方式占比图数据
    function getConsumePieTypeData(){
        let params={
            month:month.current,
            year:year.current,
        }
        getConsumePieType(params).then((res) => {
            setPieTypeData(res.data)
        }).catch((error)=>{
            console.log(error)
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
        }).catch((error)=>{
            console.log(error)
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
    
        }).catch((error)=>{
            console.log(error)
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
                            show: true,
                            textBorderColor: '#333',
                            textBorderWidth: 2
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
        }).catch((error)=>{
            console.log(error)
        })
    }

    const debounceLineSearch = debounce(buttonLineSearch, 1000);
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
        }).catch((error)=>{
            console.log(error)
        })
    }
    // 点击自定义图表按钮事件
    function handleCustomReport(){
       setIsModalType('special');
       operCustomFunc(true);
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
    // 设置自定义图表弹窗是否显示
    const operCustomFunc =(flag)=>{
        setCustomVisible(flag)
    }
    // 自定义图表弹窗输入框事件
    const handleWordChange =(e)=>{
        // console.log('输入框名字---', e.target.value)
        setChartWords(e.target.value)
    }
    // 设置自定义图表弹窗关闭事件
    const closeCustomModal = () => {
        operCustomFunc(false);
    }
     // 自定义图表弹窗提交按钮事件
    function handleChartSubmit() {
        // console.log('自定义图表提交按钮事件-图表', chartWords)
        let params = {
            name: chartWords,
        }
        createGraph(params).then((res)=>{
            if (res.data.success === true) {
                message.success('创建图表成功');
                // 跳转到绘图编辑页面
                navigate(`/index/report/flow?id=${res.data.obj.id}&name=${res.data.obj.name}`);  
               
            }
        }).catch((error)=>{
                console.log(error)
        })
    }
   
    // 获取有哪些自定义图表需要展示
    const fetchCustomGraphsData = async () => {
        try {
            const initData = await getGraphList();
            if (initData.data.success === true) {
                const graphList = initData.data.obj.list;
                const updatedGraphs = await Promise.all(graphList.map(async (item) => {
                    let additionalData = {};
                    if (item.type === 'BAR') {
                        additionalData = await getBarGraphById(item.id);
                        // console.log(111, additionalData)
                    }
                    if (item.type === 'PIE') {
                        additionalData = await getPieGraphById(item.id);
                        // console.log(222, additionalData)
                    }
                    if (item.type === 'LINE') {
                        additionalData = await getLineGraphById(item.id);
                        // console.log(333, additionalData)
                    }
                    return { ...item, configObj: additionalData };
                }))
                // console.log('updatedGraphs', updatedGraphs)
                setCustomGraphArray(updatedGraphs);
            }
        } catch (error) {
            console.error(error);
        }
    } 
    // 根据id获取柱状图数据
    const getBarGraphById = async (id) => {
        let data = await executeGraphById({ id: id });
        //   console.log('扇形图打印data.data---', data.data.obj)
        if (data.data.success === true) {
            let seriesArray = [];
            let title = data.data.obj.title;
            let barSeriesX = data.data.obj.xdataArray;
            let nameArray = data.data.obj.nameArray;
            let yDataArray = data.data.obj.ydataArray;
            for (var index = 0; index < nameArray.length; index++) {
                var seriesData = {
                    type: 'bar',
                    name: nameArray[index],
                    data: yDataArray[index]
                };
                seriesArray.push(seriesData);
            }
           return {title: title, xData: barSeriesX, seriesData: seriesArray}      
        }
    }
     // 根据id获取扇形图数据
    const getPieGraphById = async (id) => {
        let data = await executeGraphById({ id: id });
        //   console.log('扇形图打印data.data---', data.data.obj)
        if (data.data.success === true) { 
            return { title: data.data.obj.title, seriesData: data.data.obj.data }
        }
    }
     // 根据id获取折线图数据
    const getLineGraphById = async (id) => {
        let data = await executeGraphById({ id: id });
            //  console.log('折线图打印data.data---', data.data.obj)
        if (data.data.success === true) {
               let seriesArray=[];
            let title = data.data.obj.title;
            let seriesLineX =data.data.obj.xdataArray;
            let nameArray = data.data.obj.nameArray;
            let yDataArray =data.data.obj.ydataArray;

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
            return {
                        title:title,
                        legendData:nameArray,
                        xData:seriesLineX,
                        seriesData:seriesArray
                    }
        }
    }
    // 删除自定义的柱状图图表
    const deleteCustomBarGraph = (id) => { 
        deleteGraphById(id).then((data) => {
            if (data.data.success === true) {
                message.success('删除成功');
                fetchCustomGraphsData();
            } else {
                message.error(data.data.message)
            }
        })
    }
    // 编辑自定义柱状图图表
    const editCustomBarGraph = (id) => {
         navigate(`/index/report/flow?detailId=${id}`);  
    }
    // 删除自定义的折线图图表
    const deleteCustomLineGraph = (id) => {      
        deleteGraphById(id).then((data) => {
            if (data.data.success === true) {
                message.success('删除成功');
                fetchCustomGraphsData();
            } else {
                message.error(data.data.message)
            }
        })
    }
        // 编辑自定义折线图图表
    const editCustomLineGraph = (id) => {
         navigate(`/index/report/flow?detailId=${id}`);  
    }
    // 删除自定义的扇形图图表
    const deleteCustomPieGraph = (id) => { 
        deleteGraphById(id).then((data) => {
            if (data.data.success === true) {
                message.success('删除成功');
                fetchCustomGraphsData();
            } else {
                message.error(data.data.message)
            }
        })
    }
        // 编辑自定义扇形图图表
    const editCustomPieGraph = (id) => {
         navigate(`/index/report/flow?detailId=${id}`);  
    }

    return(
    <div>
        <header className='searchFormHeader'>
            <Form  className="reportWrap" layout="inline" name="searchReport"  size="small"  >
                    <Form.Item label="月份选择"  >
                        <DatePicker format='YYYY-MM' picker="month" onChange={getMonthChange} />
                    </Form.Item>
                    <Form.Item label="年份选择" >
                        <DatePicker format='YYYY'    picker="year"  onChange={getYearChange} />
                    </Form.Item>
                    <Form.Item  >
                        <Button type="primary" size="small" className="reportSearchBtn" onClick={debounceReportSearch} > 搜索</Button>
                        <Button type="primary" size="small" className="reportSearchBtn" onClick={detailReport}> 详细报告</Button>
                        <Button type="primary" size="small" className="reportSearchBtn" onClick={handleCustomReport}> 自定义图表</Button>
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
                <Form  className="reportWrap" layout="inline" name="lineReport"  size="small" form={lineForm}  
                //设置初始值
                initialValues={{'startField':dayjs().subtract(1, 'year'),'endField':dayjs(),'countNum':statisticType.current}}>
                    <Form.Item label="开始日期" name="startField" >
                        <DatePicker format='YYYY-MM-DD'   onChange={getStartDateChange} />
                        {/* defaultValue={dayjs().subtract(1, 'year')} */}
                    </Form.Item>
                    <Form.Item label="结束日期" name="endField">
                        <DatePicker format='YYYY-MM-DD'  onChange={getEndDateChange} />
                        {/* defaultValue={dayjs()}  */}
                    </Form.Item>
                    <Form.Item label="统计粒度" >
                        <Form.Item name="countNum" noStyle>
                            <Select style={{ width: 120 }}  onChange={countChange} placeholder="请选择统计粒度" allowClear>
                                    {
                                        selectedTypeArray.map( (item,index,arr) => (
                                            <Option key={item.key} value={item.key}>
                                                {item.name}
                                            </Option>
                                        ))
                                    }
                            </Select>
                        </Form.Item>
                        {/* defaultValue={statisticType.current} */}
                        <Button type="primary" size="small" className="reportSearchLineBtn" onClick={debounceLineSearch} > 搜索</Button>
                    </Form.Item>
                </Form>
                <div className='echartsLineItem'>
                    <ArgLineEcharts id="multipleLine" title={lineTitle} legendData={lineLenData} xData={lineXData} seriesData={lineData} />
                </div>
           </div>
                <div className="customGraphContainer">
                    {
                        customGraphArray.map(item => {
                            if (item.type === 'BAR') {
                                return (
                                    <div className="customGraphItem" key={item.id}>
                                        <ArgBarEcharts id={`customBar${item.id}`} key={item.id} title={item.configObj.title||'默认标题'} xData={item.configObj.xData} seriesData={item.configObj.seriesData} barType="single" />
                                        <Button className='editChartsBtn'  icon={<EditOutlined />} size="small" onClick={()=>editCustomBarGraph(item.id)}></Button>
                                        <Button className='deleteChartsBtn'  icon={<DeleteOutlined />} size="small" onClick={()=>deleteCustomBarGraph(item.id)}></Button>
                                    </div>
                                )
                            }
                            if (item.type === 'LINE') {
                                return (
                                    <div className="customGraphItem" key={item.id}>
                                        <ArgLineEcharts id={`multipleLine${item.id}`} key={item.id} title={item.configObj.title} legendData={item.configObj.legendData} xData={item.configObj.xData} seriesData={item.configObj.seriesData} />
                                         <Button className='editChartsBtn'  icon={<EditOutlined />} size="small" onClick={()=>editCustomLineGraph(item.id)}></Button>
                                        <Button className='deleteChartsBtn' icon={<DeleteOutlined />} size="small" onClick={()=>deleteCustomLineGraph(item.id)}></Button>
                                    </div>
                                )
                            }
                            if (item.type === 'PIE') {
                                return (
                                    <div className="customGraphItem" key={item.id}>
                                        <ArgPieEcharts id={`customPie${item.id}`} key={item.id} title={item.configObj.title} sourceData={item.configObj.seriesData} />
                                         <Button className='editChartsBtn'  icon={<EditOutlined />} size="small" onClick={()=>editCustomPieGraph(item.id)}></Button>
                                        <Button className='deleteChartsBtn' icon={<DeleteOutlined />} size="small" onClick={()=>deleteCustomPieGraph(item.id)}></Button>
                                    </div>
                                )
                            }
                            return null;
                        })
                    }
                </div>                       
        </section>
        {/* 详细报告弹窗 */}
        <AsyncModal   className="reportDialog" title={reportTitle}  vis={reportVisible}  modalType={isModalType} isClosable={false}  isFooter={null}  operDialogFunc={operFunc}>
            <p>{reportText}</p>
            </AsyncModal>
            {/* 自定义图表弹窗 */}
          <AsyncModal title="创建自定义图表"  vis={customVisible}    modalType={isModalType} isClosable={false}  isFooter={null}  operDialogFunc={operCustomFunc}  handleOk={closeCustomModal}>
                <Form  name="customForm" labelCol={{span:4}} autoComplete="off">
                    <Form.Item label="图表名称">
                        <Input type="text" allowClear onChange={(e)=>handleWordChange(e)} placeholder='请输入自定义的图表名称' />
                    </Form.Item>
                     <Button size="small" type="primary" onClick={handleChartSubmit} >提交</Button>
                </Form>
        </AsyncModal>
    </div>
    )
}
export default Report;