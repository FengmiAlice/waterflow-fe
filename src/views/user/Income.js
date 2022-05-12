import React, {useCallback, useEffect,useState,useRef} from 'react';
import { useStore } from '../../hooks/storeHook';
import { DatePicker,Form,Button,Input,Table,Select,Space,message,Modal,Tooltip } from 'antd';
import moment from 'moment';
import { getIncomeList,getConsumeTypeList, getPaymentTypeList,addIncomeTableRow,deleteIncomeTableRow,exportIncomeTable,addIncomeType} from '../../api/user';
import {ExclamationCircleOutlined} from '@ant-design/icons';
import '../../assets/style/App.css';
const { Option } = Select;
const {confirm} = Modal;
const {TextArea} = Input;

function Income(){
     // 列表的column项配置
     const columns = [
        {
            title: '收入日期',
            key:'time',
            dataIndex: 'time',
        },
        {
            title: '收入类别',
            key:'typeId',
            dataIndex: 'typeId',
            render: (text,record) =>{
                if(text === null || text === undefined){
                    return '无'
                }else{
                    return selectedTypeArray.map( item =>{
                        if(item.id === record.typeId) {
                            return (
                                <Space  key={item.id}>
                                    {item.name}
                                </Space>
                            )
                        }
                        return null;
                    })
                }
            } 
           
        },
        {
            title: '收入内容',
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
            render: (text,record) => 
                {                   
                    if( text === null || text === undefined){
                        return '无'
                    }else{
                        return paymentTypeArray.map(item=>{                       
                            if(item.id === record.paymentId) {
                                return (
                                    <Space  key={item.id}>
                                        {item.name}
                                    </Space>
                                )
                            }
                            return null;
                        })
                    }
                }      
        },
        {
            title: '操作',
            dataIndex: 'operation',
            render: (text, record,index) =>
                tableData.length >= 1 ? (
                <Space size="middle">
                    <Button size="small" type="primary"  onClick={ ()=> handleEdit(record)}>编辑</Button>
                    <Button size="small" type="danger"  onClick={ ()=> handleDelete(record)}>删除</Button>
                    
                </Space>
                ) : null,
        }
    ];

    const [initFlag,setInitFlag] = useState(false);//初始渲染标识
    const [total, setTotal] = useState(0); // 设置总页数
    const [tableData, setTableData] = useState([]);// 设置表格数据
    const [selectedTypeArray,setSelectedTypeArray] = useState([]);//设置获取收入类别列表
    const [paymentTypeArray,setPaymentTypeArray] = useState([]);//设置获取收入支付方式列表
    const [selectedRowKeys,setSelectedRowKeys] = useState([]);//表格全选
   
    const [form] = Form.useForm();//创建添加和编辑收入记录form实例
    const [typeForm] = Form.useForm();//创建收入记录新类别form实例

    const [rowId, setRowId] = useState('');//设置新增或删除需要传递的行id
    const [incomeTitle, setIncomeTitle] = useState('');//设置新增收入弹窗标题
    const [isModalVisible, setIsModalVisible] = useState(false);//设置新增和编辑收入记录弹窗
    const [isTypeVisible, setIsTypeVisible] = useState(false);//设置收入新类别弹窗
    const [totalAmount,setTotalAmount] = useState(0);//表格统计的总花费
     // 列表选择配置
     const rowSelection = {
        selectedRowKeys,
        onChange:onSelectChange
    }
    // 选择项选中后发生的变化
    function onSelectChange(selectedRowKeys){
        setSelectedRowKeys(selectedRowKeys)
    }

     // 获取store中的用户信息
     const { userStore } = useStore()
     const { userInfo } = userStore;

    const page = useRef(1);// 设置当前页码
    const size = useRef(10);// 设置每页条数
    const month=useRef('');//设置月份值
    const year = useRef('');//设置年份值
    const consumeType = useRef('');//设置搜索类别值
    const keyword = useRef('');//设置搜索输入框值
    const addConsumeType = useRef('');//设置新增收入记录类别值
    const addPaymentType= useRef('');//设置新增收入记录支付方式值
    //在页码或者页数变化的时候更新（在组件挂载和卸载时执行,传一个空数组，只执行一次）
    useEffect(()=>{
        if(!initFlag ){
            // console.log("初始渲染")
            year.current = moment().format("YYYY");//格式化当前年份
            getTypeList();
            getPaymentList();

            setInitFlag(true)
        }else{
            // console.log('不是初始渲染')
          
        }
        pageChange(page.current,size.current)
       
    },[page,size])

    // 点击分页按钮触发方法
    const pageChange = useCallback((currentPage,currentSize)=>{
        page.current = currentPage;
        size.current = currentSize;
        handleSearch();
    },[])

    // 获取搜索月份日期值
    function getMonthChange(date,dateString){
           // 非空判断
        dateString =dateString || '';
        month.current = dateString; 
    }
   // 获取年份日期值
   function getYearChange(date,dateString){
        // 非空判断
        // dateString = dateString || '';
        year.current = dateString;
    }
     // 获取搜索类别值
    function typeChange(value,current){
        if(value === undefined){
            consumeType.current = '';
        }else{
            consumeType.current = value;
        }
    }
     // 获取搜索输入框值
     function inputChange(e){
        keyword.current = e.target.value
    }
    // 获取收入类别列表
    function getTypeList(){
        let param={
            type:1
        }
        getConsumeTypeList(param).then((res)=>{
            if(res.data.success === true){
                setSelectedTypeArray(res.data.page.list)
            
            }
        })
    }
    // 获取收入付款方式列表
    function getPaymentList(){
        getPaymentTypeList().then( (res) => {
            if(res.data.success === true){
                setPaymentTypeArray(res.data.page.list)
            
            }
        })
    }
    // 获取新增收入记录类别值
    function addTypeChange(value){
        if(value === undefined){
            addConsumeType.current = '';
        }else{
            addConsumeType.current = value;
        }
    }
    // 获取新增收入记录支出方式值
    function addPaymentTypeChange(value){
        if(value === undefined){
            addPaymentType.current = '';
        }else{
            addPaymentType.current = value;
        }
    }
    // 批量导出支出列表
    function handleExport(){
        let params2 = {
            idList:selectedRowKeys,
            month:month.current,
            year:year.current,
            typeId:consumeType.current,
            keyword:keyword.current,

        }
        exportIncomeTable(userInfo.id,params2).then((res)=>{  
            var exportFileContent = document.getElementById('income_report').outerHTML;//获取表
            var blob = new Blob([exportFileContent], { type: "text/plain;charset=utf-8" });//使用blob,解决中文乱码问题
            blob = new Blob([String.fromCharCode(0xFEFF), blob], { type: blob.type });
        
            var contentDisposition = res.headers['content-disposition'];//在响应headers中获取表格的文件名
            var fileName=contentDisposition.substring(20);
            var link = window.URL.createObjectURL(blob);//创建新的blob url
            var a=document.createElement('a');//创建a元素
            a.style.display='none';//设置a不可见
            a.href = link;//下载的链接
            a.download = fileName;//下载的文件名
            document.body.appendChild(a);//添加a元素
            a.click();//添加元素点击事件
            document.body.removeChild(a);//移除a元素
            window.URL.revokeObjectURL(link);//释放掉blob
        })
    }
    // 添加支出按钮事件
    function handleAdd(){
        // 置空表单数据
        addConsumeType.current = '';
        addPaymentType.current = '';
        form.resetFields();
        setIncomeTitle('添加收入记录');
        setRowId('');
        setIsModalVisible(true);
    }
    // 编辑支出记录按钮操作
    function handleEdit(row){
        // 将返回的时间转换为moment格式用于编辑显示在时间组件上
        row.time = moment(row.time)
        addConsumeType.current = row.typeId;
        addPaymentType.current = row.paymentId;
        form.setFieldsValue(row) 
        setIncomeTitle('编辑收入记录')
        setRowId(row.id)
        setIsModalVisible(true);
    }
    // 删除表格中的一行数据
    function handleDelete(row){
        // 弹框
        confirm({
            title: '确认删除?',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消', 
            // 点击确认触发
            onOk() {
                let par = {
                    id:row.id
                };
                deleteIncomeTableRow(par).then((res)=>{
                    if(res.data.success === true){
                        message.success(res.data.message);
                        buttonSearch();//重新掉接口刷新表格数据
                    }
                })
            }
           
        });
    }
    // 添加支出记录弹窗信息确认操作
    function handleSubmit(){
        confirm({
            title: '确认提交?',
            icon: <ExclamationCircleOutlined />,
            okText:"确认",
            cancelText:"取消",
            // 确认按钮操作
            onOk() {
                form.validateFields().then(async (values) => {
                    // 将时间组件值转为字符串用于传值
                    let times;
                    if(values.time !== undefined){
                        times = values.time.format('YYYY-MM-DD');
                    }
                    
                    let params = {
                        id:rowId,
                        typeId:addConsumeType.current,
                        time:times,
                        description:values.description,
                        paymentId:addPaymentType.current,
                        amount:values.amount,
                        note:values.note
                    };
                    let res = await addIncomeTableRow(params);
                    if(res.data.success === true){
                        buttonSearch();//重新掉接口刷新表格数据
                        message.success(res.data.message);
                        setIsModalVisible(false);
                    }else{
                        setIsModalVisible(true);
                    }
                })
            },
          });
         
        }
    // 添加支出记录弹窗信息取消操作
    function handleCancel(){
        setIsModalVisible(false);
    }
    // 添加新类别按钮事件
    function addNewType(){
        typeForm.resetFields();
        setIsTypeVisible(true);
    }
    // 添加新类别弹窗提交按钮事件
    function handleTypeSubmit(){
        typeForm.validateFields().then(async (values) => {
            let params = {
                type:1,
                name:values.name,
                description:values.description,
            
            };
            let res = await addIncomeType(params);
            if(res.data.success === true){
                getTypeList();//重新掉接口刷新类别列表数据
                message.success("添加新类别成功");
                setIsTypeVisible(false);
            }else{
                setIsTypeVisible(true);
            }
        })
    }
    // 添加新类别弹窗取消按钮事件
    function handleTypeCancel(){
        setIsTypeVisible(false);
    }

    // 根据筛选条件搜索表格数据
    function buttonSearch(){
        // 每次翻页查询之后页码，条数重置
        page.current = 1;
        size.current = 10;
        handleSearch();
    }
    function handleSearch(){
        let param={
            month:month.current,
            year:year.current,
            pageNum:page.current,
            pageSize:size.current,
            typeId:consumeType.current,
            keyword:keyword.current,
        }
        getIncomeList(param).then((res)=>{
            if(res.data.success === true){
                let result = res.data.page;
                let table=[...result.list];
                setTotal(result.total)
                setTableData([...table])
                setTotalAmount(res.data.extraData.totalAmount);
            }
        })
    }

    return(
    <div>
        <header className='searchFormHeader'>
            <Form  className="incomeWrap" layout="inline" name="Ionsume"  size="small"  >
                    <Form.Item label="月份选择"  >
                        <DatePicker  format='YYYY-MM' picker="month" onChange={getMonthChange} />
                    </Form.Item>
                    <Form.Item label="年份选择" >
                        <DatePicker defaultValue={moment()} format='YYYY' picker="year"  onChange={getYearChange} />
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
                    <Form.Item  label="关键字" >
                        <Input  placeholder="请输入关键字" allowClear  onChange={(e)=>inputChange(e)}  />
                    </Form.Item>
                    <Form.Item  >
                        <Button type="primary" className="searchBtn" onClick={buttonSearch} > 搜索</Button>
                    </Form.Item>
            </Form>
        </header>
        <section>
                <Tooltip title="添加一条收入记录，把你的每一笔收入都记下来吧" placement="top">
                    <Button type="primary" className="addConsumeBtn"  onClick={handleAdd} >添加</Button>
                </Tooltip>
                <Tooltip title="把符合以上搜索条件的（或已勾选的）记录导出成一个Excel表格文件" placement="top">
                    <Button type="ghost"   className="exportConsumeBtn"  onClick={handleExport}>导出</Button>
                </Tooltip>
                <span className='totalStyle'>总计 {totalAmount}￥ </span>
                <Table id="income_report" rowSelection={rowSelection} columns={columns} dataSource={tableData} rowKey="id" 
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

                 {/* 添加或编辑收入记录弹窗 */}
            <Modal title={incomeTitle} forceRender visible={isModalVisible} onOk={handleSubmit} onCancel={handleCancel} okText="确认" cancelText="取消" >
                    <section >
                      <Form   name="incomeForm"  form={form}  labelCol={{span:5}}  size="middle"  autoComplete="off" >
                          <Form.Item  label="收入类别" name="typeId"  rules={[
                                {required:true,message:'请选择支出类别'},
                            
                            ]} style={{position:'relative'}} >
                                <Select style={{width:80+'%'}}  onChange={addTypeChange} placeholder="请选择" allowClear >
                                    {
                                        selectedTypeArray.map( (item,index,arr) => (
                                        
                                            <Option key={item.id} value={item.id}>
                                                {item.name}
                                            </Option>
                                        ))
                                        }
                                </Select>
                          </Form.Item>
                          <Form.Item style={{position:'absolute',right:20,top:78}}><Button type="primary" onClick={addNewType} className="typeButton">新类别</Button></Form.Item>
                          <Form.Item style={{clear:'both'}} label="收入时间" name="time"   
                                rules={[
                                    {required:true,message:'请选择收入时间'},
                                    
                                ]}  >
                                <DatePicker  style={{ width: 100+'%' }} />
                          </Form.Item>
                          <Form.Item label="详情" name="description"   
                                rules={[
                                    {required:true,message:'请输入详情'},
                                    
                                ]} >
                              <Input  placeholder="购买了什么，或者去哪玩了"    />
                          </Form.Item>
                          <Form.Item label="付款方式" name="paymentId"   
                                rules={[
                                    {required:true,message:'请选择付款方式'},
                                    
                                ]}> 
                            <Select   onChange={addPaymentTypeChange} placeholder="请选择" allowClear>
                                    {
                                    paymentTypeArray.map( (item,index,arr) => (
                                    
                                        <Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Option>
                                    ))
                                    }
                            </Select>
                          </Form.Item>
                          <Form.Item label="金额(圆整)" name="amount" 
                            rules={[
                                {required:true,message:'请输入金额'},
                            
                            ]} >
                              <Input type="number" placeholder="越精确越好，可以写小数"    />
                          </Form.Item>
                          <Form.Item label="补充描述" name="note"  >
                              <TextArea row={1} placeholder="请输入补充描述，记录一段往事供将来回忆" />
                          </Form.Item>
                      </Form>
                    </section>
            </Modal>

              {/* 新增和编辑收入页面添加类别弹窗 */}
              <Modal title='添加类型'  visible={isTypeVisible} onOk={handleTypeSubmit} onCancel={handleTypeCancel} okText="确认" cancelText="取消" >
                <Form  name="typeForm" form={typeForm}  labelCol={{span:4}}  size="middle"  autoComplete="off">
                    <Form.Item  label="名称" name="name"  
                        rules={[
                            {required:true,message:'请输入名称'},
                                    
                        ]}
                        >
                        <Input type="text" />
                    </Form.Item>
                    <Form.Item  label="描述"  name="description"  >
                        <TextArea row={1} />
                    </Form.Item>
                </Form>
            </Modal>
        </section>
    </div>
    )
}
export default Income;