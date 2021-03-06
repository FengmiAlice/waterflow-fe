import React, { useEffect,useState,useRef} from 'react';
import ArgTable from '../../components/Table';
import  AsyncModal from '../../components/Modal';
import { useStore } from '../../hooks/storeHook';
import { DatePicker,Form,Button,Input,Select,Space,message,Modal,Tooltip } from 'antd';
import moment from 'moment';
import { getConsumeList,getConsumeTypeList, getPaymentTypeList,deleteTableRow,addTableRow,deleteTableRowArray,exportConsumeTable} from '../../api/user';
import '../../assets/style/App.css';

const {  RangePicker } = DatePicker; 
const { Option } = Select;
const {confirm} = Modal;
const {TextArea} = Input;

function TestOne(props){
        // 列表的column项配置
        const columns1 = ()=> {
    
            return  [
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
                        return (
                            <Space size="middle">
                                <Button size="small" type="primary"  onClick={ ()=> handleEdit(record)}>编辑</Button>
                                <Button size="small" type="danger"  onClick={ ()=> handleDelete(record)}>删除</Button>
                                
                            </Space>
                            ) 
                    }
                    
                }
            
            ];
        }
        
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
        const [isModalVisible, setIsModalVisible] = useState(false)//设置弹窗显示或隐藏
        const [consumeTitle,setConsumeTitle] =useState('');//设置添加编辑弹框title值
        const [rowId,setRowId] = useState('');//设置新增或删除需要传递的行id
        const [totalAmount,setTotalAmounts] = useState(0);//设置表格总花费

        // 使用useForm创建新增支出记录form实例
        const [form] = Form.useForm();
        // 使用useForm创建新增支出类别form实例
        // const [typeForm] = Form.useForm();
          // 获取store中的用户信息
        const { userStore } = useStore()
        const { userInfo } = userStore;


       const month = useRef();//设置月份
       const year = useRef();//设置年份
       const times = useRef();//设置时间选择
       const consumeType= useRef('');//设置搜索支出类别值
       const paymentType = useRef('');//设置搜索支付方式值
       const keyword = useRef('');//设置搜索关键字值
       const addConsumeType= useRef('');//设置新增支出记录类别值
       const addPaymentType= useRef('');//设置新增支出记录支付方式值
       const rowKeys = useRef(null);//设置全选选择的数据
       const tableId= useRef('');//获取table id
       const tableRef=useRef(null);

        // 获取总花费
        function setMount(k){   
            setTotalAmounts(k)
        }
        //    获取选中的数据
        function handleKeys(val){
            rowKeys.current = val;
        }
        // 获取表格id
        function getIds(value){
            tableId.current = value.id
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
        // 获取搜索类别值
        function typeChange(value,current){
            if(value === undefined){
                consumeType.current = '';
            }else{
                consumeType.current = value;
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
        // 获取搜索输入框值
        function inputChange(e){
            keyword.current = e.target.value
        }
        // 查询条件初始化
        function initFunc(){
            // console.log('父组件执行初始化')
            
        }
        useEffect(()=>{
                // console.log("初始渲染")
                month.current = moment().format("YYYY-MM");//格式化当前月份
                getTypeList();
                getPaymentList();
         
        },[])
           // 获取支出记录类别值
        function addTypeChange(value){
            if(value === undefined){
                addConsumeType.current = '';
            }else{
                addConsumeType.current = value;
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

          // 添加支出按钮事件
        function handleAdd(){
            // 置空表单数据
            addConsumeType.current = '';
            addPaymentType.current = '';
            form.resetFields();
            setConsumeTitle('添加支出记录');
            setRowId('');
            operDialogFunc(true);
        }
         // 编辑支出记录按钮操作
        function handleEdit(row){
            // 将返回的时间转换为moment格式用于编辑显示在时间组件上
            row.time = moment(row.time)
            addConsumeType.current = row.typeId;
            addPaymentType.current = row.paymentId;
            form.setFieldsValue(row) 
            setConsumeTitle('编辑支出记录')
            setRowId(row.id)
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
                // 点击确认触发
                onOk() {
                    let par = {
                        id:row.id
                    };
                    deleteTableRow(par).then((res)=>{
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
            // confirm({
            //     title: '确认提交?',
            //     icon: <ExclamationCircleOutlined />,
            //     okText:"确认",
            //     cancelText:"取消",
            //     // 确认按钮操作
            //     onOk() {
            //         form.validateFields().then(async (values) => {
            //             // 将时间组件值转为字符串用于传值
            //             let times;
            //             if(values.time !== undefined){
            //                 times = values.time.format('YYYY-MM-DD');
            //             }
                        
            //             let params = {
            //                 id:rowId,
            //                 typeId:addConsumeType.current,
            //                 time:times,
            //                 description:values.description,
            //                 paymentId:addPaymentType.current,
            //                 amount:values.amount,
            //                 note:values.note
            //             };
            //             let res = await addTableRow(params);
            //             if(res.data.success === true){
            //                 buttonSearch();//重新掉接口刷新表格数据
            //                 message.success(res.data.message);
            //                 setIsModalVisible(false);
            //             }else{
            //                 setIsModalVisible(true);
            //             }
            //         })
            //     },
            // });
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
                let res = await addTableRow(params);
                if(res.data.success === true){
                    buttonSearch();//重新掉接口刷新表格数据
                    message.success(res.data.message);
                    operDialogFunc(false);
                }else{
                    operDialogFunc(true);
                }
            })
         
        }
       
        // 设置新增编辑支出弹窗事件
        const operDialogFunc = (flag)=>{
          setIsModalVisible(flag);
        }
            
         // 批量删除表格行数据
        function handleDeleteRow(){
            if(rowKeys.current === null || rowKeys.current === undefined){
                message.warning('请选择删除的数据');
                return;
            }
            // 弹框
            confirm({
                title: '确认删除?',
                okText: '确认',
                okType: 'danger',
                cancelText: '取消',
                // 点击确认触发
                onOk() {
                    let param={
                        idList:rowKeys.current
                    }
                    deleteTableRowArray(param).then((res)=>{
                        if(res.data.success === true){
                            message.success(res.data.message);
                            buttonSearch();//重新掉接口刷新表格数据
                            rowKeys.current = null;
                        }
                    })
                }
            });
        }
            // 批量导出支出列表
        function handleExport(){
            let params2 = {
                idList:rowKeys.current,
                times:times.current,
                month:month.current,
                year:year.current,
                typeId:consumeType.current,
                keyword:keyword.current,
                paymentId:paymentType.current,
            }
            exportConsumeTable(userInfo.id,params2).then((res)=>{  
                var exportFileContent = document.getElementById( tableId.current).outerHTML;//获取表
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

    

        // 根据筛选条件搜索表格数据
        function buttonSearch(){
            // 每次翻页查询之后页码，条数重置
            console.log(tableRef.current)
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
                        <Form.Item  label="关键字" >
                            <Input  placeholder="请输入关键字" allowClear  onChange={(e)=>inputChange(e)}  />
                        </Form.Item>
                        <Form.Item  >
                            <Button type="primary" className="searchBtn" onClick={buttonSearch} > 搜索</Button>
                        </Form.Item>
                </Form> 
            </header>
            <section>
            <Tooltip title="添加一条支出记录，把你的每一笔消费都记下来吧" placement="top">
                <Button type="primary" className="addConsumeBtn"  onClick={handleAdd} >添加</Button>
            </Tooltip>
            <Tooltip title="删除你勾选的所有记录，不要随便点哦，删除就没啦" placement="top">
                <Button type="danger"  className="deleteConsumeBtn" onClick={handleDeleteRow} >删除 </Button>
            </Tooltip>
            <Tooltip title="把符合以上搜索条件的（或已勾选的）记录导出成一个Excel表格文件" placement="top">
                <Button type="ghost"   className="exportConsumeBtn"  onClick={handleExport}>导出</Button>
            </Tooltip>
            <span  className='totalStyle'>总计 {totalAmount}￥</span>
            <ArgTable  
                        ref={tableRef}
                        getId={getIds}
                        owncolumns = {columns1()}
                        queryAction={getConsumeList}
                        baseProps={{ rowKey: record => record.id }}
                        params = {searchData} 
                        getRowKeys={handleKeys}
                        initMethod={initFunc}
                        setTotalAmount = {setMount}
                     
                    />
            </section>
                  
            {/* 添加或编辑支出记录弹窗 */}
            <AsyncModal title={consumeTitle} vis={isModalVisible}  handleOperate={handleSubmit} operDialogFunc={operDialogFunc} >
                <section >
                    <Form   name="consumeForm"  form={form}  labelCol={{span:5}}  size="middle"  autoComplete="off" >
                        <Form.Item  label="支出类别" name="typeId"  rules={[
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
                        {/* <Form.Item style={{position:'absolute',right:20,top:78}}><Button type="primary" onClick={addNewType} className="typeButton">新类别</Button></Form.Item> */}
                        <Form.Item style={{clear:'both'}} label="支出时间" name="time"   
                                rules={[
                                    {required:true,message:'请选择支出时间'},
                                    
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
                        <Form.Item label="补充描述" name="note" 
                            rules={[
                                {required:true,message:'请输入补充描述'},
                            
                            ]} >
                            <TextArea row={1} placeholder="请输入补充描述，记录一段往事供将来回忆" />
                        </Form.Item>
                    </Form>
                </section>
                </AsyncModal>
            {/* <Modal title={consumeTitle} forceRender visible={isModalVisible} onOk={handleSubmit} onCancel={handleCancel} okText="确认" cancelText="取消" >
                <section >
                    <Form   name="consumeForm"  form={form}  labelCol={{span:5}}  size="middle"  autoComplete="off" >
                        <Form.Item  label="支出类别" name="typeId"  rules={[
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
                        
                        <Form.Item style={{clear:'both'}} label="支出时间" name="time"   
                                rules={[
                                    {required:true,message:'请选择支出时间'},
                                    
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
                        <Form.Item label="补充描述" name="note" 
                            rules={[
                                {required:true,message:'请输入补充描述'},
                            
                            ]} >
                            <TextArea row={1} placeholder="请输入补充描述，记录一段往事供将来回忆" />
                        </Form.Item>
                    </Form>
                </section>
            </Modal> */}
        </div>
    )
}
export default TestOne;