import React, {useCallback, useEffect,useState,useRef} from 'react';
import { DatePicker,Form,Button,Table } from 'antd';
import moment from 'moment';
import { getConsumeList } from '../../api/user';

const {  RangePicker } = DatePicker; 


function Consume(){
   
  
    // 列表的column项配置
    const columns = [
        {
        title: '支出日期',
        key:'time',
        dataIndex: 'time',
        },
        {
        title: '支出类别',
        key:'typeId',
        dataIndex: 'typeId',
        },
        {
        title: '支出内容',
        key:'description',
        dataIndex: 'description',
        },
        {
            title: '金额',
            key:'amount',
            dataIndex: 'amount',
        },
        {
            title: '付款方式',
            key:'paymentId',
            dataIndex: 'paymentId',
        },
        //   {
        //     title: '操作',
    
        //   },

    ];
    
        const [initFlag,setInitFlag] = useState(false);//初始渲染标识
        const page = useRef(1);// 设置当前页码
        const size = useRef(10);// 设置每页条数
      
       const[total, setTotal] = useState(0); // 设置总页数
       const[tableData, setTableData] = useState([]);// 设置表格数据
    

       const month = useRef();//设置月份
       const year = useRef();//设置年份
       const times = useRef();//设置时间选择
 
          // 点击分页按钮触发方法
        const pageChange = useCallback((currentPage,currentSize)=>{
 

            page.current = currentPage;
            size.current = currentSize;
               handleSearch();
        },[])
       //在页码或者页数变化的时候更新，传一个空数组，只执行一次（在组件挂载和卸载时执行）
       useEffect(()=>{
            if(!initFlag ){
                // console.log("初始渲染")
                month.current = moment().format("YYYY-MM")

                setInitFlag(true)
            }else{
                // console.log('不是初始渲染')
              
            }
            
            pageChange(page.current,size.current)
           
       },[page,size])
 
 



    // 获取日期范围值
    function getRangeValue(date,dateStringArray){

        // 非空判断
        if( dateStringArray !== undefined || dateStringArray.length !== 0 ){
            dateStringArray = dateStringArray.filter((item,i)=> item.trim() !== '' )
   
            if(dateStringArray.length === 0 ){
                times.current = '';
            }else{
                times.current = dateStringArray.join(' - ');
            }
           
        }else {
            times.current = '';
        }  
    }

    // 获取月份日期值
    function getMonthChange(date,dateString){
        month.current = dateString; 
    }
 
    // 获取年份日期值
    function getYearChange(date,dateString){
        // 非空判断
        dateString = dateString || '';
        year.current = dateString;
    }
   
    // 根据条件搜索表格数据
    function buttonSearch(){
        page.current = 1;
        size.current = 10;
        handleSearch();
    }
    function handleSearch(){

        let param={
            times:times.current,
            month:month.current,
            year:year.current,
            pageNum:page.current,
            pageSize:size.current
        }
     
        getConsumeList(param).then((res)=>{
            if(res.status === 200){
                let result = res.data.page;
                let table=[...result.list];
                setTotal(result.total)
                setTableData([...table])
            }
        })

    }
   
    return(
    <div>
        <header>
            <Form  className="consumeWrap" layout="inline" name="Consume"  size="small"  >
                    <Form.Item  label="日期选择" >
                        <RangePicker format='YYYY-MM-DD' onChange={getRangeValue}  disabledDate={
                        (current) => {
                            // 选择今天及今天之前的日期
                            return current && current > moment().startOf('day');
                        }} />
                    </Form.Item>
                    <Form.Item label="月份选择"  >
                        <DatePicker defaultValue={moment()} format='YYYY-MM' picker="month" onChange={getMonthChange} />
                    </Form.Item>
                    <Form.Item label="年份选择" >
                        <DatePicker format='YYYY'    picker="year"  onChange={getYearChange} />
                    </Form.Item>
                    <Form.Item  >
                        <Button type="primary" className="searchBtn" onClick={buttonSearch} > 搜索</Button>
                    </Form.Item>
            </Form>
        </header>
       <section>
            <Table  columns={columns} dataSource={tableData} rowKey="id"
                pagination={
                    {   showSizeChanger:true,
                        pageSizeOptions:['10','20'],  
                        pageSize:size.current,
                        current:page.current,
                        total:total,
                        showTotal:()=>{return `共${total}条数据`}, 
                        onChange:pageChange,
                     
                    }
                }
            />
       </section>
    </div>
    )
}
export default Consume;