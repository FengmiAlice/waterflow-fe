import React  from 'react';
import { DatePicker,Form,Button, } from 'antd';
import moment from 'moment';
import { getConsumeList } from '../../api/user';
const {  RangePicker } = DatePicker; 

function Consume(){
    //函数组件获取form实例
    // const [form] = Form.useForm();
    let times='';
    let month='';
    let year='';
    // 获取日期范围值
    function getRangeValue(date,dateString){
        // console.log(date)//原始日期
        console.log(dateString)//字符串日期格式
        // 非空判断
        if(dateString !== '' || dateString !== undefined){
            times = dateString.join(' - ');
        }else{
            times = '';
        }
      
        console.log(times)
    }
    // 获取月份日期值
    function getMonthChange(date,dateString){
        // console.log(date)
        console.log(dateString)
        
        month =dateString;
    }
    // 获取年份日期值
    function getYearChange(date,dateString){
        // console.log(moment())
        console.log(dateString)
        year=dateString;
    }
   
    // 根据条件搜索表格数据
    function handleSearch(){
        let param={
            times:times,
            month:month,
            year:year
        }
        getConsumeList(param).then((res)=>{
            console.log(res)
        })
        // axios.get('/proxy/consume/list',{
        //     params:{
        //         times:times,
        //         month:month,
        //         year:year
        //     }
        // }).then( (res)=>{
        //     console.log(res)
        // })
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
                        <DatePicker format='YYYY-MM' picker="month" onChange={getMonthChange} />
                    </Form.Item>
                    <Form.Item label="年份选择" >
                        <DatePicker format='YYYY'    picker="year"  onChange={getYearChange} />
                    </Form.Item>
                    <Form.Item  >
                        <Button type="primary" className="searchBtn" onClick={handleSearch} > 搜索</Button>
                    </Form.Item>
            </Form>
        </header>
       
        
        
    </div>
    )
}
export default Consume;