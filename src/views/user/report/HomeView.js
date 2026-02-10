import {useEffect,useState,useRef} from 'react';
import { DatePicker,Form,Button,Statistic,Select, message  } from 'antd';
import ArgPieEcharts from '../../../components/Echarts/pie';
import ArgLineEcharts from '../../../components/Echarts/line';
import {getFamilyOverview,getFamilyConsume,getFamilyAccount,getFamilyIncome,getFamilyLineConsumeData} from '../../../api/report';
import { debounce } from '../../../utils/appTools';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
const { Option } = Select;
function HomeView() {
    // 搜索条件的一些参数获取
    const month = useRef('');//设置月份
    const year = useRef('');//设置年份  
    const navigate = useNavigate();
    // 获取家庭总览数据
    const [consumeAcount,setConsumeAcount] = useState(0);
    const [incomeAcount,setIncomeAcount] =useState(0);
    const [wealthAcount, setWealthAcount] = useState(0);
    const [consumeData,setConsumeData] = useState([]);  // 设置获取各类开支占比饼图数据
    const [accountData,setAccountData] =useState([]); // 设置获取各类账户余额占比饼图数据
    const [incomeData,setIncomeData] =useState([]);  // 设置获取各类收入占比饼图数据
    // 设置form表单实例
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
    const [lineTitle, setLineTitle] = useState('');//支出收入折线图title
    const [lineData, setLineData] = useState([]);//支出收入折线图表数据
    const [lineXData,setLineXData] =useState([]);//支出收入折线图x轴数据
    const [lineLenData,setLineLenData] = useState([]);//支出收入折线图例数据

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

     useEffect(() => {
            // 设置支出收入余额搜索参数默认值
            let forwardYear = dayjs().subtract(1, 'year').format('YYYY-MM-DD');//开始日期与结束日期相差1年
            startDate.current = forwardYear;
            endDate.current = dayjs().format("YYYY-MM-DD");//结束日期
            
            buttonLineSearch();
            // 初始化调用buttonSearch内的各个函数，给各类收入、各类开支、各类支付方式饼图，概览数据赋值
            getReportAccount();
            getConsumePieData();
            getAccountPieTypeData();
            getIncomeData();
     }, []);
    
    // 设置搜索防抖功能
    const debounceReportSearch = debounce(buttonSearch,1000);
        // 各类收入、各类开支、各类支付方式饼图搜索按钮事件
    function buttonSearch() {
        getReportAccount();
        getConsumePieData();
        getAccountPieTypeData();
        getIncomeData();
    }
     // 获取顶部概览填充数据
    function getReportAccount() {
        let params={
            month:month.current,
            year:year.current,
        }
        getFamilyOverview(params).then((res)=>{
            if(res.data.success === true){
                setConsumeAcount(res.data.obj.totalConsume);
                setIncomeAcount(res.data.obj.totalIncome);
                setWealthAcount(res.data.obj.totalWealth);
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
        getFamilyConsume(params).then((res)=>{
            setConsumeData(res.data)
        }).catch((error)=>{
            console.log(error)
        })
    }
        // 获取各类账户余额占比图数据
    function getAccountPieTypeData(){
        let params={
            month:month.current,
            year:year.current,
        }
        getFamilyAccount(params).then((res) => {
            setAccountData(res.data)
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
        getFamilyIncome(params).then((res)=>{
            setIncomeData(res.data)
        }).catch((error)=>{
            console.log(error)
        })
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
    // 获取折线图搜索开始日期
    const debounceLineSearch = debounce(buttonLineSearch, 1000);
    // 支出收入余额折线图搜索按钮
    function buttonLineSearch(){
        let params={
            startDate:startDate.current,
            endDate:endDate.current,
            statisticType:statisticType.current
        }
        getFamilyLineConsumeData(params).then((res)=>{
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
    // 返回按钮事件
    const turnBack = () => {
        navigate(-1);
    }

   

    return(
        <div>
            <header className='searchFormHeader reportSearchHeader'>
                <Form  className="reportWrap" layout="inline" name="searchReport"  size="small"  >
                        <Form.Item label="月份选择"  >
                            <DatePicker format='YYYY-MM' picker="month" onChange={getMonthChange} />
                        </Form.Item>
                        <Form.Item label="年份选择" >
                            <DatePicker format='YYYY'    picker="year"  onChange={getYearChange} />
                        </Form.Item>
                        <Form.Item  >
                            <Button type="primary" size="small" className="reportSearchBtn" onClick={debounceReportSearch} > 搜索</Button>
                        </Form.Item>
                    </Form>
                    <Button type="text" onClick={turnBack} className="turnHomeView">返回</Button>
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
                            <ArgPieEcharts id="consumePie" title="各类开支占比图" sourceData={consumeData} />
                        </div>
                        <div className='echartsPieItem'>
                            <ArgPieEcharts id="incomePie" title="各类收入占比图" sourceData={incomeData} />
                        </div>
                         <div className='echartsPieItem'>
                            <ArgPieEcharts id="consumeTypePie" title="各类账户余额占比图" sourceData={accountData} />
                        </div>
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
                            <Button type="primary" size="small" className="reportSearchLineBtn" onClick={debounceLineSearch} > 搜索</Button>
                        </Form.Item>
                    </Form>
                    <div className='echartsLineItem'>
                        <ArgLineEcharts id="multipleLine" title={lineTitle} legendData={lineLenData} xData={lineXData} seriesData={lineData} />
                    </div>
                </div>
            </section>
        </div>
    )
}
export default HomeView;