import React, {useCallback, useEffect,useState,useRef} from 'react';
import { DatePicker,Form,Button,Input,Table,Select,Space,message,Modal } from 'antd';
import moment from 'moment';
import { getConsumeList,getConsumeTypeList, getPaymentTypeList,addTableRow,deleteTableRow } from '../../api/user';
import { UserOutlined, LockOutlined,ExclamationCircleOutlined } from '@ant-design/icons';
import '../../assets/style/App.css';
const {  RangePicker } = DatePicker; 
const { Option } = Select;
const {confirm} = Modal;

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
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record,index) =>
                    tableData.length >= 1 ? (
                    <Space size="middle">
                        <Button size="small" type="text">编辑</Button>
                        <Button size="small" type="text" onClick={ ()=> handleDelete(text,record,index)}>删除</Button>
                      
                    </Space>
                    // <Popconfirm title="确定删除?"  okText="确定" cancelText="取消" onConfirm={() => this.handleDelete(record.key)}>
                    //   <a onClick={handleDelete(record.key)}>删除</a>
                    // </Popconfirm>
              
                  ) : null,
            },
       ];
    
       const [initFlag,setInitFlag] = useState(false);//初始渲染标识
       const [total, setTotal] = useState(0); // 设置总页数
       const [tableData, setTableData] = useState([]);// 设置表格数据
       const [selectedTypeArray,setSelectedTypeArray] = useState([]);//设置支出类别列表
       const [consumeType, setConsumeType]= useState('');//设置支出类别
       const [paymentTypeArray,setPaymentTypeArray] = useState([]);//设置支付方式列表
       const [paymentType,setPaymentType] = useState('');//设置支付方式值
        // 使用useForm创建form实例
       const [form] = Form.useForm();
       const [isModalVisible, setIsModalVisible] = useState(false)//设置弹窗显示或隐藏
       const [keyword,setKeyword] = useState('');

       const page = useRef(1);// 设置当前页码
       const size = useRef(10);// 设置每页条数
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
                month.current = moment().format("YYYY-MM");//格式化当前月份
                getTypeList();
                getPaymentList();

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
    // 获取类别列表
    function getTypeList(){
        let param={
            type:2
        }
        getConsumeTypeList(param).then((res)=>{
            if(res.data.success === true){
                setSelectedTypeArray(res.data.page.list)
             
            }
        })
    }
    // 获取支出方式列表
    function getPaymentList(){
        getPaymentTypeList().then( (res) => {
            if(res.data.success === true){
                setPaymentTypeArray(res.data.page.list)
             
            }
        })
    }
    // 获取类别值
    function typeChange(value,current){
 
        if(value === undefined){
            setConsumeType('')
        }else{
            setConsumeType(value)
        }
    }
    // 获取支出方式值
    function paymentTypeChange(value){

        if(value===undefined){
            setPaymentType('')
        }else{
            setPaymentType(value)
        }
    }
    // 获取搜索输入框值
    function inputChange(e){
        console.log(e.target.value)
        setKeyword(e.target.value)
    }


    // 删除表格中的一行数据
    function handleDelete(text,record,index){
        console.log(text)
        console.log(record)
        console.log(index)
        // 删除弹框
        confirm({
            title: '是否确认删除?',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            // 点击确认触发
            onOk() {
                let par = {
                    id:record.id
                };
                deleteTableRow(par).then((res)=>{
                    console.log(res)
                    if(res.data.success === true){
                        message.success('删除成功');
                        handleSearch()
                    }
                })
            },
            // 点击取消触发
            onCancel() {
                console.log('Cancel');
            },
        });
    }
    // 添加支出按钮事件
    function handleAdd(){
        setIsModalVisible(true);
    }
    // 添加支出记录弹窗信息确认操作
    function handleSubmit(){
    confirm({
        title: '确认修改?',
        icon: <ExclamationCircleOutlined />,
        okText:"确定",
        cancelText:"取消",
        // 确认按钮操作
        onOk() {
            form.validateFields().then(async (values) => {
                // 调用登陆Api，获取结果
                let params = {
                    typeId:values.typeId,
                    time:values.time,
                    description:values.description,
                    paymentId:values.paymentId,
                    amount:values.amount,
                    note:values.note
                };
                let res = await addTableRow(params);
                if(res.data.success === true){
                 
                }
            })
        },
      });
      setIsModalVisible(true);
    }
    // 添加支出记录弹窗信息取消操作
    function handleCancel(){
        setIsModalVisible(false);
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
            pageSize:size.current,
            typeId:consumeType,
            paymentId:paymentType,
            keyword:keyword
        }
        getConsumeList(param).then((res)=>{
            if(res.data.success === true){
                let result = res.data.page;
                let table=[...result.list];
                setTotal(result.total)
                setTableData([...table])
            }
        })
    }
   
    return(
    <div>
        <header className='searchFormHeader'>
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
                    <Form.Item label="类别">
                        <Select style={{ width: 120 }} onChange={typeChange} allowClear={true}>
                                {
                                selectedTypeArray.map( (item,index,arr) => (
                                
                                    <Option key={item.id} value={item.id}>
                                        {item.name}
                                    </Option>
                                ))
                                }
                        </Select>
                    </Form.Item>
                    <Form.Item  label="支付方式">
                        <Select  style={{ width: 120 }} onChange={paymentTypeChange} allowClear={true}>
                                {
                                paymentTypeArray.map( (item,index,arr) => (
                                
                                    <Option key={item.id} value={item.id}>
                                        {item.name}
                                    </Option>
                                ))
                                }
                        </Select>
                    </Form.Item>
                    <Form.Item  label="关键字" name="keycord" prefix={<UserOutlined className="site-form-item-icon"/>}>
                        <Input  placeholder="请输入关键字" allowClear  onChange={(e)=>inputChange(e)}  />
                    </Form.Item>
                    <Form.Item  >
                        <Button type="primary" className="searchBtn" onClick={buttonSearch} > 搜索</Button>
                    </Form.Item>
            </Form>
           
        </header>
       <section>
            <Button type="primary" className="addConsumeBtn" onClick={handleAdd}>添加新的支出记录</Button>
            <Button type="ghost"   className="exportConsumeBtn">导出</Button>
            <Button type="primary" className="deleteConsumeBtn" danger>删除</Button>
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

            {/* 添加支出记录弹窗 */}
            <Modal title="添加支出记录" forceRender visible={isModalVisible} onOk={handleSubmit} onCancel={handleCancel} okText="提交" cancelText="取消" >
              <section >
                      <Form  className="formWrap  infoFormWrap" name="consume"  form={form}   size="large"  autoComplete="off" >
                          <Form.Item  label="支出类别" name="username" prefix={<UserOutlined className="site-form-item-icon"/>}  >
                            <Select style={{ width: 120 }} onChange={typeChange} allowClear={true}>
                                {
                                    selectedTypeArray.map( (item,index,arr) => (
                                    
                                        <Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Option>
                                    ))
                                    }
                            </Select>
                          </Form.Item>
                          <Form.Item  label="昵称" name="name" prefix={<UserOutlined className="site-form-item-icon"/>}  
                              rules={[
                                  { 
                                      pattern: /^[\u4e00-\u9fa5]|[a-zA-Z]/, 
                                      message: "昵称可以是字母或者中文"
                                  }
                              ]} >
                              
                              <Input  placeholder="请输入昵称"   />
                          </Form.Item>
                  
                          <Form.Item label="手机号" name="phone" prefix={<LockOutlined className="site-form-item-icon"/>} 
                              rules={[ 
                                  {
                                      pattern:/^1[345678]\d{9}$/,
                                      message: "请输入正确的11位手机号"
                                  }
                              ]}>
                              
                              <Input  placeholder="请输入手机号，用于找回密码，选填"    />
                          </Form.Item>
                          <Form.Item label="邮箱" name="email"  prefix={<LockOutlined className="site-form-item-icon"/>} 
                              rules={[   
                                  {
                                      pattern:/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                                      message: "请输入正确的邮箱格式"
                                  }
                              ]}>
                                  
                              <Input  type="text" placeholder="请输入邮箱，用于找回密码，选填"  />
                          </Form.Item>
                         
                      </Form>
                  </section>
            </Modal>
       </section>
    </div>
    )
}
export default Consume;