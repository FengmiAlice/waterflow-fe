import React, {useEffect,useState,useRef} from 'react';
import ArgTable from '../../components/Table';
import AsyncModal from '../../components/Modal';
import { useStore } from '../../hooks/storeHook';
import { DatePicker,Form,Button,Input,Select,Space,message,Modal,Tooltip} from 'antd';
import moment from 'moment';
import { getConsumeList, getConsumeTypeList, getPaymentTypeList, addTableRow, deleteTableRow, deleteTableRowArray, exportConsumeTable, addType } from '../../api/user';
const {  RangePicker } = DatePicker; 
const { Option } = Select;
const {confirm} = Modal;
const {TextArea} = Input;

function Consume(){
    const columns = ()=>{
        return [
            {
                title: '支出日期',
                key:'time',
                dataIndex: 'time',
            },
            {
                title: '支出类别',
                key:'typeId',
                dataIndex: 'typeId',
                render: record => 
                (
                <>
                    {
                        selectedTypeArray.map( item =>
                        {
                        
                            if(item.id === record) {
                                return (
                                    <Space  key={item.id}>
                                        {item.name}
                                    </Space>
                                )
                            }
                            return null;
                        })
                    }
                </>
                )
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
                sorter:true
                
            },
            {
                title: '付款方式',
                key:'paymentId',
                dataIndex: 'paymentId',
                render: record => 
                (
                <>
                    {
                        paymentTypeArray.map(item=>{
                            if(item.id === record) {
                                return (
                                    <Space  key={item.id}>
                                    {item.name}
                                    </Space>
                                )
                            }
                            return null;
                        })
                    }
                </>
                )
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record,index) =>{
                    return(
                        <Space size="middle" >
                            <div className='largeBtnBox'>
                                <Button size="small" type="primary"  onClick={ ()=> handleEdit(record)}>编辑</Button>
                                <Button size="small" type="danger"   onClick={ ()=> handleDelete(record)}>删除</Button>
                            </div>
                            <div className="miniBtnBox">
                                <Button size="small" type="text"  className='miniPrimaryBtn' onClick={ ()=> handleEdit(record)}>编辑</Button>
                                <Button size="small" type="text"  danger onClick={ ()=> handleDelete(record)}>删除</Button>
                            </div>
                        </Space>
                    )
                }    
            }
        ];
    }

    // 获取store中的用户信息
    const { userStore } = useStore()
    const { userInfo } = userStore;
    let currentMonth =  moment().format("YYYY-MM");
    let initSearchData = {
            times:'',
            month:currentMonth,
            year:'',
            typeId:'',
            paymentId:'',
            keyword:'',
    }
    const [searchData,setSearchData] = useState(initSearchData);//设置初始传参列表
    const [selectedTypeArray,setSelectedTypeArray] = useState([]);//设置支出类别列表
    const [paymentTypeArray,setPaymentTypeArray] = useState([]);//设置支付方式列表
    // 使用useForm创建新增支出记录form实例
    const [form] = Form.useForm();
    // 使用useForm创建新增支出类别form实例
    const [typeForm] = Form.useForm();

    
    const consumeFooter = useState(true);//设置添加编辑支出类弹窗是否显示底部按钮
    const typeFooter = useState(true);//设置新类别弹窗是否显示底部按钮
    const [isModalVisible, setIsModalVisible] = useState(false)//设置是否显示添加编辑支出类弹窗
    const [isTypeVisible,setTypeVisible] = useState(false);//设置新类别弹窗
    const [consumeTitle,setConsumeTitle] = useState('');//设置添加编辑弹窗title值
    const [isModalType,setIsModalType] = useState('');//设置弹窗输出类型

    const [rowId,setRowId] = useState('');//设置新增或删除需要传递的行id
    const [totalAmount,setTotalAmounts] = useState(0);//设置表格总花费
    const [rowKeys,setRowKeys] = useState([]);//设置表格选择的数据


    // 搜索条件的一些参数获取
    const month = useRef();//设置月份
    const year = useRef();//设置年份
    const times = useRef();//设置时间选择
    const consumeType= useRef('');//设置搜索支出类别值
    const paymentType = useRef('');//设置搜索支付方式值
    const keyword = useRef('');//设置搜索关键字值
    const addConsumeType= useRef('');//设置新增支出记录类别值
    const addPaymentType= useRef('');//设置新增支出记录支付方式值

    const tableIds = useRef('consume_report');//获取支出列表table id
    const tableRef=useRef(null);//设置表格的ref

    let curTime= moment().format("YYYY-MM-DD");
    const consumeTime = useRef(curTime);//设置支出记录默认时间
    const [isAddFlag,setAddFlag] = useState(false)//标识是否是新增
    //在页码或者页数变化的时候更新（在组件挂载和卸载时执行，传一个空数组，只执行一次）
       useEffect(()=>{
            month.current = moment().format("YYYY-MM");//初始化赋值当前月份
            getTypeList();
            getPaymentList();
            window.addEventListener('resize', () =>{
                if(document.activeElement.tagName === 'INPUT' ||
                    document.activeElement.tagName === 'TEXTAREA'||document.activeElement.tagName === 'ant-picker-input') {
                    window.setTimeout(() => {
                        if('scrollIntoView' in document.activeElement) {
                            document.activeElement.scrollIntoView();
                        } else {
                            document.activeElement.scrollIntoViewIfNeeded();
                        }
                    }, 0);
                }
            });
       },[])
 
    // 设置表格总花费方法
    function setMount(k){   
        setTotalAmounts(k);
    }
    // 设置表格选择的数据
    function handleKeys(val){
        setRowKeys(val)
    }
    
    // 设置查询条件初始化
    function initFunc(){
        // console.log('父组件执行初始化')
        
    }
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
    // 获取支出记录时间
    function getTimeChange(date, dateString) {
        // console.log(date)
        // console.log(dateString)
        consumeTime.current = dateString;
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
        }).catch((error)=>{
            console.log(error)
        })
    }
    // 获取支出方式列表
    function getPaymentList(){
        getPaymentTypeList().then( (res) => {
            if(res.data.success === true){
                setPaymentTypeArray(res.data.page.list)
             
            }
        }).catch((error)=>{
            console.log(error)
        })
    }
    // 获取支出搜索类别值
    function typeChange(value,current){
        if(value === undefined){
            consumeType.current = '';
        }else{
            consumeType.current = value;
        }
    }
     // 获取支出记录类别值
    function addTypeChange(value){
        if(value === undefined){
            addConsumeType.current = '';
        }else{
            addConsumeType.current = value;
        }
    }
    // 获取搜索支出方式值
    function paymentTypeChange(value){
        if(value===undefined){
            paymentType.current = '';
        }else{
            paymentType.current = value;
        }
    }
    // 获取支出记录支出方式值
    function addPaymentTypeChange(value){
        if(value === undefined){
            addPaymentType.current = '';
        }else{
            addPaymentType.current = value;
        }
    }
    // 获取搜索输入框值
    function inputChange(e){
        keyword.current = e.target.value
    }

    // 添加新类别按钮事件
    function addNewType(){
        operTypeFunc(true);
        setIsModalType('special');
        typeForm.resetFields();
       
    }
    // 添加类别弹窗提交按钮事件
    async function handleTypeSubmit() {
        try {
            const values = await typeForm.validateFields();
            // console.log('类别',values)
            if (values) {
                let params = {
                    type:2,
                    name:values.typeName,
                    description:values.typeDescription,
                };
                addType(params).then((res) => {
                    if(res.data.success === true){
                        getTypeList();//重新掉接口刷新类别列表数据
                        message.success("添加新类别成功");
                        operTypeFunc(false);
                    }else{
                        operTypeFunc(true);
                    }
                }).catch((error)=>{
                    console.log(error)
                })
            }
        } catch (err) {
            console.log('validate failed',err)
        }
    }


    // 添加支出按钮事件
    function handleAdd(){
        // 置空表单数据
        addConsumeType.current = '';
        addPaymentType.current = '';
        setAddFlag(true);
        if (isAddFlag === true) {
            // console.log(isAddFlag,1111)
            consumeTime.current = moment().format("YYYY-MM-DD")
        }
        form.resetFields();
        setConsumeTitle('添加支出记录');
        setIsModalType('common');
        setRowId('');
        operDialogFunc(true);  
    }

    // 编辑支出记录按钮操作
    function handleEdit(row) {
        // console.log('支出编辑',row)
        setAddFlag(false);
        if (isAddFlag === false) {
            //  console.log(isAddFlag,2222)
            consumeTime.current = row.timeStr;
        }
        // 将返回的时间转换为moment格式用于编辑显示在时间组件上
        row.time = moment(row.time)
        addConsumeType.current = row.typeId;
        addPaymentType.current = row.paymentId;
        form.setFieldsValue(row) 
        setConsumeTitle('编辑支出记录');
        setIsModalType('common');
        setRowId(row.id);
        operDialogFunc(true);
    }

    // 删除表格中的一行数据
    function handleDelete(row){
        // confirm弹框
        confirm({
            title: '确认删除?',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消', 
            // confirm弹框内确认按钮事件
            onOk() {
                let par = {
                    id:row.id
                };
                deleteTableRow(par).then((res)=>{
                    if(res.data.success === true){
                        message.success(res.data.message);
                        buttonSearch();//重新掉接口刷新表格数据
                    }
                }).catch((error)=>{
                    console.log(error)
                })
            }
           
        });
    }

    // 批量删除表格行数据
    function handleDeleteRow(){
        if(rowKeys.length === 0){
            message.warning('请选择删除的数据');
            return;
        }
        // confirm弹框
        confirm({
            title: '确认删除?',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            // confirm弹框内确认按钮事件
            onOk() {
                let param={
                    idList:rowKeys
                }
                deleteTableRowArray(param).then((res)=>{
                    if(res.data.success === true){
                        message.success(res.data.message);
                        buttonSearch();//重新掉接口刷新表格数据
                        setRowKeys([]);//清空选择的数据
                    }
                }).catch((error)=>{
                    console.log(error)
                })
            }
        });
    }

    // 批量导出支出列表
    function handleExport(){
        let params2 = {
            idList:rowKeys,
            times:times.current,
            month:month.current,
            year:year.current,
            typeId:consumeType.current,
            keyword:keyword.current,
            paymentId:paymentType.current,
        }
        exportConsumeTable(userInfo.id,params2).then((res)=>{  
            var exportFileContent = document.getElementById(tableIds.current).outerHTML;//获取表
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
        }).catch((error)=>{
            console.log(error)
        })
    }

    // 添加支出记录弹窗信息确认操作
    async function handleSubmit() {
        try {
            const values = await form.validateFields();
            // console.log('支出', values)
            if (values) {
                let params = {
                    id: rowId,
                    typeId: values.typeId,//addConsumeType.current
                    time: values.time.format('YYYY-MM-DD'),//consumeTime.current
                    description: values.description,
                    paymentId: values.paymentId,//addPaymentType.current
                    amount: values.amount,
                    note: values.note
                };
                addTableRow(params).then((res) => {
                    if (res.data.success === true) {
                        buttonSearch();//重新掉接口刷新表格数据
                        message.success(res.data.message);
                        operDialogFunc(false);
                    } else {
                        operDialogFunc(true)
                    }
                }).catch((error) => {
                    console.log(error)
                })    
            }
        } catch (error) {
            console.log('validate failed',error)
        }
    }

    // 设置新增编辑支出弹窗显示隐藏事件
    const operDialogFunc = (flag)=>{
        setIsModalVisible(flag);
    }
     // 设置新增类别弹窗显示隐藏事件
    const operTypeFunc = (flag)=>{
        setTypeVisible(flag)
    }

    // 根据筛选条件搜索表格数据
    function buttonSearch(){
        // 每次翻页查询之后页码，条数重置
        if(tableRef.current){
            tableRef.current.resetPage()
        }
        setSearchData({
            times:times.current,
            month:month.current,
            year:year.current,
            typeId:consumeType.current,
            paymentId:paymentType.current,
            keyword:keyword.current,
        })
    }

    return(
    <div>
        <header className='searchFormHeader'>
            <Form  className="consumeWrap" layout="inline" name="Consume"  size="small"  >
                    <Form.Item  label="日期选择" >
                        <RangePicker  onChange={getRangeValue}  disabledDate={
                        (current) => {
                            // 选择今天及今天之前的日期
                            return current && current > moment().startOf('day');
                        }}  allowClear />
                    </Form.Item>
                    <Form.Item label="月份选择"  >
                        <DatePicker defaultValue={moment()} format='YYYY-MM' picker="month" onChange={getMonthChange}placeholder="请选择月份" allowClear  />
                    </Form.Item>
                    <Form.Item label="年份选择" >
                        <DatePicker format='YYYY'    picker="year"  onChange={getYearChange} placeholder="请选择年份" allowClear />
                    </Form.Item>
                    <Form.Item label="类别">
                        <Select style={{ width: 120 }} onChange={typeChange} placeholder="请选择类别" allowClear >
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
                        <Select  style={{ width: 120 }} onChange={paymentTypeChange} placeholder="请选择支付方式" allowClear >
                                {
                                paymentTypeArray.map( (item,index,arr) => (
                                
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
                        <Button size="small" type="primary" className="searchBtn" onClick={buttonSearch} > 搜索</Button>
                    </Form.Item>
            </Form>
        </header>
        <section>
                <Tooltip title="添加一条支出记录，把你的每一笔消费都记下来吧" placement="top">
                    <Button size="small" type="primary" className="addConsumeBtn"  onClick={handleAdd} >添加</Button>
                </Tooltip>
                <Tooltip title="把符合以上搜索条件的（或已勾选的）记录导出成一个Excel表格文件" placement="top">
                    <Button size="small" type="ghost"   className="exportConsumeBtn"  onClick={handleExport}>导出</Button>
                </Tooltip>
                <Tooltip title="删除你勾选的所有记录，不要随便点哦，删除就没啦" placement="top">
                    <Button size="small" type="danger"  className="deleteConsumeBtn" onClick={handleDeleteRow} >删除 </Button>
                </Tooltip>
                <span className='totalStyle'>总计 {totalAmount}￥ </span>

                <ArgTable 
                    ref={tableRef}
                    tableType={'consume'}            
                    owncolumns = {columns()}
                    queryAction={getConsumeList}
                    baseProps={{ rowKey: record => record.id }}
                    params = {searchData} 
                    getRowKeys={handleKeys}
                    initMethod={initFunc}
                    setTotalAmount = {setMount}
                />                           

                {/* 添加或编辑支出记录弹窗 */}
                <AsyncModal title={consumeTitle}  modalType={isModalType} vis={isModalVisible} isClosable={false} isFooter={consumeFooter} operDialogFunc={operDialogFunc} handleOk={handleSubmit}>
                    <section >
                        <Form   name="consumeForm"  form={form} initialValues={{'time':moment()}} labelCol={{span:5}}  size="middle"  autoComplete="off" >
                            <Form.Item  label="支出类别" >
                                <Form.Item  name="typeId"  rules={[ {required:true,message:'请选择支出类别'}, ]} noStyle>
                                    <Select className='consumeTypeSelect'  onChange={addTypeChange} placeholder="请选择支出类别" allowClear >
                                            {
                                                selectedTypeArray.map( (item,index,arr) => (
                                                    <Option key={item.id} value={item.id}>
                                                        {item.name}
                                                    </Option>
                                                ))
                                            }
                                    </Select>
                                </Form.Item>    
                                <Button  type="primary" onClick={addNewType} className="consumeTypeButton">新类别</Button>   
                            </Form.Item>
                            <Form.Item style={{clear:'both'}} label="支出时间" name="time"  
                                    rules={[
                                        {required:true,message:'请选择支出时间'},
                                        
                                    ]}  >
                                    <DatePicker   format='YYYY-MM-DD' picker="day" style={{ width: 100+'%' }} onChange={getTimeChange} placeholder="请选择支出时间" allowClear />
                            </Form.Item>
                            <Form.Item label="详情" name="description"   
                                    rules={[
                                        {required:true,message:'请输入详情'},
                                        
                                    ]} >
                                <Input  placeholder="购买了什么，或者去哪玩了" allowClear   />
                            </Form.Item>
                            <Form.Item label="付款方式" name="paymentId"   
                                    rules={[
                                        {required:true,message:'请选择付款方式'},
                                        
                                    ]}> 
                                <Select   onChange={addPaymentTypeChange} placeholder="请选择付款方式" allowClear>
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
                                <Input type="number" placeholder="越精确越好，可以写小数"  allowClear  />
                            </Form.Item>
                            <Form.Item label="补充描述" name="note" >
                                <TextArea row={1} placeholder="请输入补充描述，记录一段往事供将来回忆" />
                            </Form.Item>
                        </Form>
                    </section>
                </AsyncModal>
                
                {/* 添加新类别弹窗 */}
                <AsyncModal title='添加类型' modalType={isModalType} vis={isTypeVisible} isClosable={false} isFooter={typeFooter} operDialogFunc={operTypeFunc} handleOk={handleTypeSubmit}>
                    <Form  name="typeForm" form={typeForm}  labelCol={{span:4}}  size="middle"  autoComplete="off">
                        <Form.Item  label="名称" name="typeName"  
                            rules={[
                                        {required:true,message:'请输入名称'},
                                        
                            ]}
                            >
                            <Input type="text" />
                        </Form.Item>
                        <Form.Item  label="描述"  name="typeDescription"  >
                            <TextArea row={1} />
                        </Form.Item>
                    </Form>      
                </AsyncModal>
        </section>
    </div>
    )
}
export default Consume;