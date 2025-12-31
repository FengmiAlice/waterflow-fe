 
import React, { useEffect, useState,useRef} from 'react';
import { DatePicker,Form,Button,Select, message  } from 'antd';
import ArgPieEcharts from '../../../components/Echarts/pie';
import ArgLineEcharts from '../../../components/Echarts/line';
import { typePieInvestAmount,typePieInvestCurrent,typeLineInvestAmount } from '../../../api/user';
import {debounce} from '../../../utils/appTools';
import dayjs from 'dayjs';
const { Option } = Select;

function InvestReport() {
    const [pieData, setPieData] = useState([]); // 设置投入金额占比饼图数据
    const [pieCurrentData, setPieCurrentData] = useState([]) // 设置投资余额占比饼图数据
    const [lineTitle, setLineTitle] = useState('');//支出收入折线图title
    const [lineLenData,setLineLenData] = useState([]);//支出收入折线图例数据
    const [lineYData, setLineYData] = useState([]);//支出收入折线图Y轴数据
    const [lineXData, setLineXData] = useState([]);//支出收入折线图x轴数据

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
    

    useEffect(()=>{
        getPieInvest();
        getPieCurrent();
        // 设置支出收入余额搜索参数默认值
        let forwardYear = dayjs().subtract(1, 'year').format('YYYY-MM-DD');//开始日期与结束日期相差1年
        startDate.current = forwardYear;
        endDate.current = dayjs().format("YYYY-MM-DD");//结束日期

        buttonLineSearch();
    }, [])
    
    //获取各类投入金额占比饼图数据
    function getPieInvest(){
        let params={}
        typePieInvestAmount(params).then((res) => {
            // console.log('投入金额',res)
            setPieData(res.data)
        }).catch((error)=>{
            console.log(error)
        })
    }

    // 获取各类投资余额占比饼图数据
    function getPieCurrent() {
        let params = {};
        typePieInvestCurrent(params).then((res) => { 
            // console.log('投资余额',res)
            setPieCurrentData(res.data)
        }).catch((error) => {
            console.log(error)
        })
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

    const debounceLineSearch = debounce(buttonLineSearch, 1000);
    // 支出收入余额折线图搜索按钮
    function buttonLineSearch(){
        let params={
            startDate:startDate.current,
            endDate:endDate.current,
            statisticType:statisticType.current
        }
        typeLineInvestAmount(params).then((res)=>{
            let seriesArray=[];
            let title = res.data.title;
            let seriesLineX = res.data.xdataArray;
            let nameArray = res.data.nameArray;
            let yDataArray = res.data.ydataArray;
            // console.log('Y轴数据---',yDataArray)
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
            setLineYData(seriesArray);
        }).catch((error)=>{
            console.log(error)
        })
    }

    return (
    <div>
        <div className='investReportContainer'>
            <div className='echartsInvestPieItem'>
                <ArgPieEcharts id="amountPie" title="各类投入金额占比图" sourceData={pieData} />
            </div>
            <div className='echartsInvestPieItem'>
                <ArgPieEcharts id="currentPie" title="各类投资余额占比图" sourceData={pieCurrentData} />
            </div>
        </div>
        <div className="lineContiner">
                <Form  className="reportWrap" layout="inline" name="Report"  size="small" form={lineForm}  
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
                    <ArgLineEcharts id="multipleLine" title={lineTitle} legendData={lineLenData} xData={lineXData} seriesData={lineYData} />
                </div>
        </div>
    </div>
    )
}
export default InvestReport;