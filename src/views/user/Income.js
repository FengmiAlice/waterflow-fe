import React, {useEffect,useState,useRef} from 'react';
import ArgTable from '../../components/Table';
import AsyncModal from '../../components/Modal';
import { useStore } from '../../hooks/storeHook';
import { DatePicker,Form,Button,Input,Select,Space,message,Modal,Tooltip } from 'antd';
import moment from 'moment';
import { getIncomeList,getConsumeTypeList, getPaymentTypeList,addIncomeTableRow,deleteIncomeTableRow,exportIncomeTable,addIncomeType} from '../../api/user';
import {debounce} from '../../utils/appTools';
const { Option } = Select;
const {confirm} = Modal;
const {TextArea} = Input;

function Income(){
     // 列表的column项配置
     const columns = ()=>{
        return [
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
                render: (text, record,index) =>{
                    return (
                        <Space size="middle">
                              <div className='largeBtnBox'>
                                <Button size="small" type="primary"  onClick={ ()=> handleEdit(record)}>编辑</Button>
                                <Button size="small" type="danger"  onClick={ ()=> handleDelete(record)}>删除</Button>
                              </div>
                              <div className="miniBtnBox">
                                <Button size="small" type="text" className='miniPrimaryBtn' onClick={ ()=> handleEdit(record)}>编辑</Button>
                                <Button size="small" type="text"  danger onClick={ ()=> handleDelete(record)}>删除</Button>
                              </div>
                            
                        </Space>
                        ) 
                }
                
            }
        ];
    }
    let currentYear =  moment().format("YYYY");
    let initSearchData = {
            month:'',
            year:currentYear,
            typeId:'',
            keyword:'',
    }

    
    const incomeFooter = useState(true);//设置是否显示新增和编辑收入记录弹窗底部按钮
    const incomeTypeFooter = useState(true);//设置是否显示收入新类别弹窗底部按钮

    const [searchData,setSearchData] = useState(initSearchData);//设置初始传参列表
    const [selectedTypeArray,setSelectedTypeArray] = useState([]);//设置获取收入类别列表
    const [paymentTypeArray,setPaymentTypeArray] = useState([]);//设置获取收入支付方式列表
    const [rowId, setRowId] = useState('');//设置新增或删除需要传递的行id

    const [incomeTitle, setIncomeTitle] = useState('');//设置新增收入弹窗标题
    const [isModalType,setIsModalType] = useState('');//设置弹窗输出类型
    const [isModalVisible, setIsModalVisible] = useState(false);//设置新增和编辑收入记录弹窗

    const [isTypeVisible, setIsTypeVisible] = useState(false);//设置收入新类别弹窗
    const [totalAmount,setTotalAmounts] = useState(0);//设置表格总花费
    const [rowKeys,setRowKeys] = useState([]);//设置表格选择的数据


     // 获取store中的用户信息
     const { userStore } = useStore()
     const { userInfo } = userStore;
    const [form] = Form.useForm();//创建添加和编辑收入记录form实例
    const [typeForm] = Form.useForm();//创建收入记录新类别form实例


    const month=useRef('');//设置月份值
    const year = useRef('');//设置年份值
    const consumeType = useRef('');//设置搜索类别值
    const keyword = useRef('');//设置搜索输入框值
    const addConsumeType = useRef('');//设置新增收入记录类别值
    const addPaymentType= useRef('');//设置新增收入记录支付方式值
    const tableId= useRef('income_report');//获取收入列表table id
    const tableRef=useRef(null);//设置表格的ref
    let curTime= moment().format("YYYY-MM-DD");
    const incomeTime = useRef(curTime);//设置收入记录默认时间
    const [isAddFlag,setAddFlag] = useState(false)//标识是否是新增
    //在页码或者页数变化的时候更新（在组件挂载和卸载时执行,传一个空数组，只执行一次）
    useEffect(()=>{
        // if(!initFlag ){
        //     // console.log("初始渲染")
        //     setInitFlag(true)
        // }else{
        //     // console.log('不是初始渲染')
        // }
        // pageChange(page.current,size.current)
        year.current = moment().format("YYYY");//格式化当前年份
        getTypeList();
        getPaymentList();
       
    },[])

    // 点击分页按钮触发方法
    // const pageChange = useCallback((currentPage,currentSize)=>{
    //     page.current = currentPage;
    //     size.current = currentSize;
    //     handleSearch();
    // },[])

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
    // 获取搜索月份日期值
    function getMonthChange(date,dateString){
           // 非空判断
        dateString =dateString || '';
        month.current = dateString; 
    }
    // 获取收入时间事件
    function getTimeChange(date, dateString) {
        // 非空判断
        dateString =dateString || '';
        incomeTime.current = dateString;
    }
   // 获取年份日期值
    function getYearChange(date, dateString) {
        // 非空判断
        dateString =dateString || '';
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
        }).catch((error)=>{
            console.log(error)
        })
    }
    // 获取收入付款方式列表
    function getPaymentList(){
        getPaymentTypeList().then( (res) => {
            if(res.data.success === true){
                setPaymentTypeArray(res.data.page.list)
            
            }
        }).catch((error)=>{
            console.log(error)
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
            idList:rowKeys,
            month:month.current,
            year:year.current,
            typeId:consumeType.current,
            keyword:keyword.current,

        }
        exportIncomeTable(userInfo.id,params2).then((res)=>{  
            var exportFileContent = document.getElementById(tableId.current).outerHTML;//获取表
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
    // 添加支出按钮事件
    function handleAdd(){
        // 置空表单数据
        addConsumeType.current = '';
        addPaymentType.current = '';
         setAddFlag(true);
        if (isAddFlag === true) {
            incomeTime.current = moment().format("YYYY-MM-DD")
        }
        form.resetFields();
        setIncomeTitle('添加收入记录');
        setIsModalType('common');
        setRowId('');
        operDialogFunc(true);
    }
    // 编辑支出记录按钮操作
    function handleEdit(row){
         setAddFlag(false);
        if (isAddFlag === false) {
            incomeTime.current = row.timeStr;
        }
        // 将返回的时间转换为moment格式用于编辑显示在时间组件上
        row.time = moment(row.time);
        addConsumeType.current = row.typeId;
        addPaymentType.current = row.paymentId;
        form.setFieldsValue(row); 
        setIncomeTitle('编辑收入记录');
        setIsModalType('common');
        setRowId(row.id);
        operDialogFunc(true);
    }
    // 删除表格中的一行数据
    function handleDelete(row){
        // 弹框
        confirm({
            title: '确认删除?',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消', 
            // 弹框内确认按钮事件
            onOk() {
                let par = {
                    id:row.id
                };
                deleteIncomeTableRow(par).then((res)=>{
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
     // 使用防抖函数来限制表单提交的频率
    const debounceIncomeSubmit = debounce(handleSubmit, 1000);
    // 添加收入记录弹窗信息确认操作
    async function handleSubmit() {
        try {
            const values = await form.validateFields();
            // 将时间组件值转为字符串用于传值
            // let times;
            // if(values.time !== undefined){
            //     times = values.time.format('YYYY-MM-DD');
            // }
            // console.log('收入信息', values)

            if (values) {
                let params = {
                    id:rowId,
                    typeId:values.typeId,//addConsumeType.current
                    time:values.time.format('YYYY-MM-DD'),//incomeTime.current
                    description:values.description,
                    paymentId:values.paymentId,//addPaymentType.current
                    amount:values.amount,
                    note:values.note
                };
                addIncomeTableRow(params).then((res) => {
                    if(res.data.success === true){
                        buttonSearch();//重新掉接口刷新表格数据
                        message.success(res.data.message);
                        operDialogFunc(false);
                    }else{
                        operDialogFunc(true);
                    }
                }).catch((error)=>{
                    console.log(error)
                })  
            }
        } catch (error) {
            console.log('validate failed',error)
        }
    }

    // 添加新类别按钮事件
    function addNewType(){
        operTypeFunc(true);
        setIsModalType('special');
        typeForm.resetFields();
    }
    // 添加新类别弹窗提交按钮事件
    async function handleTypeSubmit() {
        try {
            const values = await typeForm.validateFields();
            // console.log('收入类别',values)
            if (values) {
                let params = {
                    type:1,
                    name:values.name,
                    description:values.description,
                }
                addIncomeType(params).then((res) => {
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
        setIsTypeVisible(flag);
    }

    // 设置搜索防抖功能
    const debounceIncomeSearch = debounce(buttonSearch,1000);
    // 根据筛选条件搜索表格数据
    function buttonSearch(){
        // 每次翻页查询之后页码，条数重置
        if(tableRef.current){
            tableRef.current.resetPage();
        }
        setSearchData({
            month:month.current,
            year:year.current,
            typeId:consumeType.current,
            keyword:keyword.current,
        })
    }
    // function handleSearch(){
    //     let param={
    //         month:month.current,
    //         year:year.current,
    //         pageNum:page.current,
    //         pageSize:size.current,
    //         typeId:consumeType.current,
    //         keyword:keyword.current,
    //     }
    //     getIncomeList(param).then((res)=>{
    //         if(res.data.success === true){
    //             let result = res.data.page;
    //             let table=[...result.list];
    //             setTotal(result.total)
    //             setTableData([...table])
    //             setTotalAmount(res.data.extraData.totalAmount);
    //         }
    //     }).catch((error)=>{
        //     console.log(error)
        // })
    // }

    return(
    <div>
        <header className='searchFormHeader'>
            <Form  className="incomeWrap" layout="inline" name="Income"  size="small"  >
                    <Form.Item label="月份选择"  >
                        <DatePicker  format='YYYY-MM' picker="month" onChange={getMonthChange} placeholder="请选择月份" allowClear />
                    </Form.Item>
                    <Form.Item label="年份选择" >
                        <DatePicker defaultValue={moment()} format='YYYY' picker="year"  onChange={getYearChange} placeholder="请选择年份" allowClear />
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
                    <Form.Item  label="关键字" >
                        <Input  placeholder="请输入关键字" allowClear  onChange={(e)=>inputChange(e)}  />
                    </Form.Item>
                    <Form.Item  >
                        <Button size="small" type="primary" className="searchBtn" onClick={debounceIncomeSearch} > 搜索</Button>
                    </Form.Item>
            </Form>
        </header>
        <section>
                <Tooltip title="添加一条收入记录，把你的每一笔收入都记下来吧" placement="top">
                    <Button size="small" type="primary" className="addConsumeBtn"  onClick={handleAdd} >添加</Button>
                </Tooltip>
                <Tooltip title="把符合以上搜索条件的（或已勾选的）记录导出成一个Excel表格文件" placement="top">
                    <Button size="small" type="ghost"   className="exportConsumeBtn"  onClick={handleExport}>导出</Button>
                </Tooltip>
                <span className='totalStyle'>总计 {totalAmount}￥ </span>
                <ArgTable 
                    ref={tableRef}
                    tableType={'income'}
                
                    owncolumns = {columns()}
                    queryAction={getIncomeList}
                    baseProps={{ rowKey: record => record.id }}
                    params = {searchData} 
                    getRowKeys={handleKeys}
                    initMethod={initFunc}
                    setTotalAmount = {setMount}
                />            
                {/* <Table id="income_report" rowSelection={rowSelection} columns={columns} dataSource={tableData} rowKey="id" 
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
                /> */}

                 {/* 添加或编辑收入记录弹窗 */}
                 <AsyncModal title={incomeTitle}  modalType={isModalType} vis={isModalVisible} isClosable={false} isFooter={incomeFooter} operDialogFunc={operDialogFunc} handleOk={debounceIncomeSubmit}>
                 <section >
                      <Form   name="incomeForm"  form={form} initialValues={{'time':moment()}} labelCol={{span:5}}  size="middle"  autoComplete="off" >
                          <Form.Item  label="收入类别">
                                 <Form.Item  name="typeId"  rules={[ {required:true,message:'请选择收入类别'},]} noStyle>
                                    <Select  className='incomeTypeSelect' onChange={addTypeChange} placeholder="请选择收入类别" allowClear >
                                        {
                                        selectedTypeArray.map( (item,index,arr) => (
                                        
                                            <Option key={item.id} value={item.id}>
                                                {item.name}
                                            </Option>
                                        ))
                                        }
                                    </Select>
                                 </Form.Item>
                                
                                <Button  type="primary" onClick={addNewType} className="incomeTypeButton">新类别</Button>
                          </Form.Item>
                          <Form.Item style={{clear:'both'}} label="收入时间" name="time"   
                                rules={[
                                    {required:true,message:'请选择收入时间'},
                                    
                                ]}  >
                                <DatePicker  format='YYYY-MM-DD'  onChange={getTimeChange} style={{ width: 100+'%' }} placeholder="请选择收入时间" allowClear  />
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
                              <Input type="number" placeholder="越精确越好，可以写小数"   allowClear />
                          </Form.Item>
                          <Form.Item label="补充描述" name="note"  >
                              <TextArea row={1} placeholder="请输入补充描述，记录一段往事供将来回忆" />
                          </Form.Item>
                      </Form>
                    </section>
                 </AsyncModal>

              {/* 新增和编辑收入页面添加类别弹窗 */}
              <AsyncModal  title='添加类型' modalType={isModalType} vis={isTypeVisible} isClosable={false} isFooter={incomeTypeFooter}  operDialogFunc={operTypeFunc} handleOk={handleTypeSubmit}>
                    <Form  name="typeForm" form={typeForm}  labelCol={{span:4}}  size="middle"  autoComplete="off">
                        <Form.Item  label="名称" name="name"  
                            rules={[
                                {required:true,message:'请输入名称'},
                                        
                            ]}
                            >
                            <Input type="text" placeholder="请输入名称" allowClear />
                        </Form.Item>
                        <Form.Item  label="描述"  name="description"  >
                            <TextArea row={1} />
                        </Form.Item>
                    </Form>
              </AsyncModal>
           
        </section>
    </div>
    )
}
export default Income;