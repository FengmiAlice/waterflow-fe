import React, {useEffect,useState,useRef} from 'react';
import ArgTable from '../../../components/Table';
import AsyncModal from '../../../components/Modal';
import {useNavigate} from 'react-router-dom';
import { DatePicker,Form,Button,Input,Select,Space,message,Modal,Drawer} from 'antd';
import moment from 'moment';
import { getInvestedList, getInvestedStatistic,getPaymentTypeList, addInvested,deleteInvested,addDividend,updateInvestCurrent,addSingleInvest,deleteSingleInvest} from '../../../api/user';
import {debounce} from '../../../utils/appTools';

const { Option } = Select;
const {confirm} = Modal;
const {TextArea} = Input;


function Invest() {
    // 理财记录列表column
    const columns = ()=>{
        return [
            {
                title: '日期',
                key:'time',
                dataIndex: 'time',
            },
            {
                title: '内容',
                key:'description',
                dataIndex: 'description',
            },
            {
                title: '满仓金额',
                key:'plan',
                dataIndex: 'plan',
            },
            {
                title: '投入金额',
                key:'amount',
                dataIndex: 'amount',
                sorter:true
            },
            {
                title: '仓位',
                key:'position',
                dataIndex: 'position',
                sorter:true
                
            },
            {
                title: '当前金额',
                key:'current',
                dataIndex: 'current',
                sorter:true
                
            },
            {
                title: '累计收益',
                key:'totalProfit',
                dataIndex: 'totalProfit',
                sorter:true
                
            },
            {
                title: '收益率',
                key:'profitRate',
                dataIndex: 'profitRate',
                sorter:true
                
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
    // 投资明细列表column
    const singleInvestColumns = () => {  
        return [
            {
                    title: '日期',
                    key:'time',
                    dataIndex: 'time',
                },
                {
                    title: '类型',
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
                title: '支付方式',
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
                                <Button size="small" type="primary"  onClick={ ()=> handleSingleEdit(record)}>编辑</Button>
                                <Button size="small" type="danger"   onClick={ ()=> handleSingleDelete(record)}>删除</Button>
                            </div>
                            <div className="miniBtnBox">
                                <Button size="small" type="text"  className='miniPrimaryBtn' onClick={ ()=> handleSingleEdit(record)}>编辑</Button>
                                <Button size="small" type="text"  danger onClick={ ()=> handleSingleDelete(record)}>删除</Button>
                            </div>
                        </Space>
                    )
                }    
            }
        ]
    }
    const defaultTitle = () => '投资明细';//设置投资明细表格标题
    const navigate = useNavigate();

    // 使用useForm创建新增理财记录form实例
    const [form] = Form.useForm();
    const [redForm] = Form.useForm();
    const [profitForm] = Form.useForm();
    const [investSingleForm] = Form.useForm();
    const tableRef = useRef(null);//设置表格的ref
    const singleInvestRef=useRef(null);//设置理财记录抽屉下投资明细的ref
    const keyword = useRef('');//设置搜索关键字值
    let currentTime= moment().format("YYYY-MM-DD");
    const investTime = useRef(currentTime);//添加理财记录默认时间
    const paymentType = useRef('');//设置接受账户值
    const paymentSingleType = useRef('');//设置投资明细账户值
    let currentRedTime= moment().format("YYYY-MM-DD");
    const redTime = useRef(currentRedTime);//设置默认分红时间
    let currentsingleTime= moment().format("YYYY-MM-DD");
    const singleTime = useRef(currentsingleTime);//设置投资明细时间
   

    const [totalPlan, setTotalPlan] = useState(0);//设置计划投资金额
    const [totalAmount, setTotalAmount] = useState(0);//设置已投资金额
    const [totalPosition, setTotalPosition] = useState(0);//设置总仓位
    const [totalCurrent, setTotalCurrent] = useState(0);//设置当前金额
    const [totalProfit, setTotalProfit] = useState(0);//设置累计收益
    const [totalProfitRate, setTotalProfitRate] = useState(0);//设置整体收益率
    let initParamsData = {
        keyword: keyword.current,
    }
    const [searchData, setSearchData] = useState(initParamsData);//设置初始传参列表
    const [investOpen, setInvestOpen] = useState(false);//抽屉是否可见Drawer 是否可见，小于 4.23.0 使用 visible
    const [investChildrenOpen, setInvestChildrenOpen] = useState(false);//投资明细抽屉是否可见Drawer 是否可见
    const [investTitle, setInvestTitle] = useState('');//设置添加理财记录抽屉标题
    const [isAddFlag, setAddFlag] = useState(false);//标识是否是理财记录新增
    const [rowId,setRowId] = useState('');//设置新增或删除需要传递的行id
    const [isModalType, setIsModalType] = useState('');//设置分红弹窗输出类型
    const [isProfitType, setProfitType] = useState('');//设置更新收益弹窗类型
    const [isRedVisible, setRedVisible] = useState(false);//设置是否显示分红弹窗
    const [isProfitVisible, setProfitVisible] = useState(false);//设置是否显示更新收益弹窗
    const typeFooter = useState(true);//设置分红、更新收益弹窗是否显示底部按钮
    const [isRedFlag,setIsRedFlag] = useState(false);//标识是否新增分红
    const [paymentTypeArray, setPaymentTypeArray] = useState([]);//设置支付方式列表
    const [redType, setRedType] = useState('CASH_OUT');//设置默认分红类型
    const [rowKeys, setRowKeys] = useState([]);//设置理财记录表格选择的数据
    const [singleKeys, setSingleRowKeys] = useState([])//设置投资明细表格选择的数据
    const [investSingleTitle,setInvestSingleTitle] = useState('');//设置添加投资明细抽屉标题
    const [singleId, setSingleId] = useState('');//设置投资明细抽屉需要传递的行id
    const [isSingleFlag,setIsSingleFlag] = useState(false);//标识是否新增投资明细
    // 设置分红方式列表
    const redTypeArray = [
        { value: 'CASH_OUT', name: '现金分红' },
        { value:'RE_INVEST', name:'红利再投资'}
    ]

    useEffect(() => {
        getStatistics();
        getPaymentList();
    }, [])
    
    // 获取理财计划投资金额、已投资金额等
    function getStatistics() {
        let params = {}
        getInvestedStatistic(params).then((res) => {
            if (res.data.success === true) {
                setTotalPlan(res.data.obj.totalPlan);
                setTotalAmount(res.data.obj.totalAmount);
                setTotalPosition(res.data.obj.totalPosition);
                setTotalCurrent(res.data.obj.totalCurrent);
                setTotalProfit(res.data.obj.totalProfit);
                setTotalProfitRate(res.data.obj.totalProfitRate);
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    // 获取接收账户列表
   function getPaymentList(){
        getPaymentTypeList().then( (res) => {
            if(res.data.success === true){
                setPaymentTypeArray(res.data.page.list);
             
            }
        }).catch((error)=>{
            console.log(error)
        })
    }

    // 获取分红支出方式值
    function paymentTypeChange(value) {
        if(value === undefined){
            paymentType.current = '';
        }else{
            paymentType.current = value;
        }
    }

    // 获取投资明细买入卖出支付方式值
    function paymentSingleTypeChange(value) {
         if(value === undefined){
            paymentSingleType.current = '';
        }else{
            paymentSingleType.current = value;
        }
    }

    // 获取理财支出记录时间
    function getTimeChange(date, dateString) {
        // 非空判断
        dateString =dateString || '';
        investTime.current = dateString;
    }

    // 获取分红记录时间
    function getRedTimeChange(date, dateString) {
         // 非空判断
        dateString = dateString || '';
        redTime.current = dateString;
    }

    // 获取投资明细时间
    function getInvestTimeChange(date, dateString) {
         // 非空判断
        dateString = dateString || '';
        singleTime.current = dateString;
    } 
    
    // 获取搜索输入框值
    function inputChange(e){
        keyword.current = e.target.value
    }
    
    // 设置查询条件初始化
    function initFunc(){
    // console.log('父组件执行初始化')  
    }

    // 选择分红方式下拉选择事件
   const redChange = (value) => {
    //    console.log('分红方式下拉选择事件', value)
       setRedType(value)
    }

    // 分红按钮事件
    const handleRed = () => {
        // console.log('是否是新增分红',isRedFlag)
        if (isRedFlag === true) {
             redTime.current = moment().format("YYYY-MM-DD");
        }
        paymentType.current = '';
        setRedType('CASH_OUT');
        operRedFunc(true)
        setIsModalType('special');
        redForm.resetFields();
    }

    // 更新收益按钮事件
    const handleProfit = () => {
        operProfitFunc(true)
        setProfitType('special');
        profitForm.resetFields();
    }

    // 设置新增分红弹窗显示隐藏事件
    const operRedFunc = (flag) => {
        setRedVisible(flag)
    }

    // 设置更新收益弹窗显示隐藏事件
    const operProfitFunc = (flag) => {
        setProfitVisible(flag)
    }

    const debounceRedSubmit = debounce(handleRedSubmit, 500);
    // 添加分红记录弹窗提交按钮事件
    async function handleRedSubmit() {
        try {
            const values = await redForm.validateFields();
            //  console.log('分红记录表单提交---',values)
            if (values) {
                let params;
                if (redType === 'CASH_OUT') {
                    params = {
                        investId: rowId,
                        paymentId: values.paymentId,
                        dividentType:values.dividentType,
                        time: values.time.format("YYYY-MM-DD"),
                        amount: values.amount,
                    };
                } else {
                    params = {
                        investId: rowId,
                        dividentType: values.dividentType,
                        latestAmount:values.latestAmount,
                    };
                }
               
                addDividend(params).then((res) => {
                    if(res.data.success === true){
                        operRedFunc(false);
                    }else{
                        operRedFunc(true);
                    }
                }).catch((error)=>{
                    console.log(error)
                })
            }
        } catch (err) {
            console.log('validate failed',err)
        }
    }

    // 更新收益弹窗提交按钮事件
    const debounceProfitSubmit = debounce(handleProfitSubmit, 500);
    async function handleProfitSubmit() { 
          try {
              const values = await profitForm.validateFields();
            //   console.log('更新收益表单提交---',values)
            if (values) {
                let params = {
                        investId: rowId,
                        newCurrent:values.newCurrent,
                  
                }
                updateInvestCurrent(params).then((res) => {
                    if (res.data.success === true) {
                        buttonSearch();//重新掉接口刷新表格数据
                        operProfitFunc(false);
                    }else{
                        operProfitFunc(true);
                    }
                }).catch((error)=>{
                    console.log(error)
                })
            }
        } catch (err) {
            console.log('validate failed',err)
        }
    }

    // 添加理财记录
    function handleAdd() {
        setAddFlag(true);
        setIsRedFlag(true);
          if (isAddFlag === true) {
            // console.log(isAddFlag,1111)
            investTime.current = moment().format("YYYY-MM-DD")
        }
        form.resetFields();
        setInvestOpen(true);
        setInvestTitle('添加理财记录');
        setRowId('');
    }

    // 编辑理财记录
    function handleEdit(row) {
        // console.log('理财记录编辑---', row);
        setAddFlag(false);
        setIsRedFlag(false);
        // setInputVal(row.description);//给投资明细抽屉项目名称赋值
        investSingleForm.setFieldsValue({ 'investName': row.description });
        if (isAddFlag === false) {
            //  console.log(isAddFlag,2222)
            investTime.current = row.timeStr;
        }
        // 将返回的时间转换为moment格式用于编辑显示在时间组件上
        row.time = moment(row.time);
        form.setFieldsValue(row);

        setInvestTitle('编辑理财记录');
        setRowId(row.id);
        setInvestOpen(true);
    }
    // 统计图表按钮事件
    function turnInvestSoft() {
          navigate('/index/invest/investReport')
    }

    // 关闭理财记录抽屉事件
    function onClose() {
        setInvestOpen(false);
    }

    // 删除理财记录
    function handleDelete(row) {
        if (row.current > 0) {
            alert("账户尚有余额，不能删除，请先将余额全部转出。");
            return;
        }
        // confirm弹框
        confirm({
            title: '注意，一旦删除该项目，其下所有的买入/卖出记录也会被同时删除。请确认是否还要删除？',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消', 
            // confirm弹框内确认按钮事件
            onOk() {
                let par = {
                    id:row.id
                };
                deleteInvested(par).then((res)=>{
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

    // 关闭投资明细抽屉事件
    function onChildrenClose() {
        setInvestChildrenOpen(false);
    }

    // 添加投资明细买入卖出按钮事件
    function handleSingleInvest() {
        setIsSingleFlag(true);
        if (isSingleFlag === true) {
                 // console.log(isSingleFlag,1111)
            singleTime.current = moment().format("YYYY-MM-DD");
        }
        // 添加投资明细记录之前将投资明细表单除了time、investName之外的字段值置空
        investSingleForm.setFieldsValue({ 'type': "", 'amount':"",'paymentId':'','note':""});
        paymentSingleType.current = '';
        // 设置标题
        setInvestSingleTitle('添加投资明细记录');
        setInvestChildrenOpen(true);
        setSingleId('');
    }

    // 编辑单条投资明细买入卖出
    function handleSingleEdit(row) {
        // console.log('投资明细记录编辑---', row)
        setIsSingleFlag(false);
        if (isSingleFlag === false) { 
            // console.log(isSingleFlag,2222)
            singleTime.current = row.time;
        }
        // 将返回的时间转换为moment格式用于编辑显示在时间组件上
        row.time = moment(row.time);
        investSingleForm.setFieldsValue(row);
        setInvestSingleTitle('编辑投资明细记录');
        setInvestChildrenOpen(true);
        setSingleId(row.id)
    }

    // 删除单条投资明细买入卖出
    function handleSingleDelete(row) { 
         // confirm弹框
        confirm({
            title: '请确认是否删除？',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消', 
            // confirm弹框内确认按钮事件
            onOk() {
                let par = {
                    id:row.id
                };
                deleteSingleInvest(par).then((res)=>{
                    if(res.data.success === true){
                        message.success(res.data.message);
                     
                    }
                }).catch((error)=>{
                    console.log(error)
                })
            }
           
        });
    }

    // 设置理财记录表格选择的数据
    function handleKeys(val){
        setRowKeys(val)
    }

    // 设置投资明细表格选择的数据
    function handleSingleKeys(val) {
        setSingleRowKeys(val)
    }
    
    //买入卖出投资明细抽屉提交按钮事件
    const debounceInvestSingleSubmit = debounce(handleSingleSubmit, 500);
    async function handleSingleSubmit() { 
             try {
            const values = await investSingleForm.validateFields();
            // console.log('投资明细买入卖出表单提交', values)
            if (values) {
                let params = {
                    id:singleId,//投资明细表id
                    investId: rowId,//理财记录表id
                    time: values.time.format('YYYY-MM-DD'),
                    investName:values.investName,//理财记录表单的详情
                    type:values.type,
                    amount: values.amount,
                    paymentId:values.paymentId,
                    note: values.note
                };
                addSingleInvest(params).then((res) => {
                    if (res.data.success === true) {
                        buttonSearch();//重新掉接口刷新表格数据
                        message.success(res.data.message);
                        setInvestChildrenOpen(false);
                    } else {
                        setInvestChildrenOpen(true);
                    }
                }).catch((error) => {
                    console.log(error)
                })    
            }
        } catch (error) {
            console.log('validate failed',error)
        }
    }

    // 使用防抖函数来限制表单提交的频率
    const debounceInvestSubmit = debounce(handleSubmit, 1000);
        // 提交理财记录表单
       async function handleSubmit() {
        try {
            const values = await form.validateFields();
            // console.log('理财记录表单提交', values)
            if (values) {
                let params = {
                    id: rowId,
                    time: values.time.format('YYYY-MM-DD'),
                    description: values.description,
                    plan: values.plan,
                    amount: values.amount,
                    current: values.current,
                    note: values.note
                };
                addInvested(params).then((res) => {
                    if (res.data.success === true) {
                        buttonSearch();//重新掉接口刷新表格数据
                        message.success(res.data.message);
                        setInvestOpen(false);
                    } else {
                        setInvestOpen(true);
                    }
                }).catch((error) => {
                    console.log(error)
                })    
            }
        } catch (error) {
            console.log('validate failed',error)
        }
    }

     // 设置搜索防抖功能
     const debounceInvestSearch = debounce(buttonSearch,1000);
    // 根据筛选条件搜索表格数据
    function buttonSearch(){
        // 每次翻页查询之后页码，条数重置
        if(tableRef.current){
            tableRef.current.resetPage();
        }
        setSearchData({
            keyword:keyword.current,
        })
    }

    return (
        <div>
            <header className='searchFormHeader'>
                <Form  className="investWrap" layout="inline" name="Invest"  size="small"  >
                        <Form.Item  label="关键字" name="keyword">
                            <Input  placeholder="请输入关键字" allowClear  onChange={(e)=>inputChange(e)}  />
                        </Form.Item>
                        <Form.Item  >
                            <Button size="small" type="primary" className="searchBtn" onClick={debounceInvestSearch} > 搜索</Button>
                        </Form.Item>
                </Form>
            </header>
            <section>
                
                <Button size="small" type="primary" className="addInvestBtn"  onClick={handleAdd} >添加新理财项目</Button>
                <Button size="small" type="primary"    onClick={turnInvestSoft}>统计图表</Button>
                <span className='totalStyle'>计划投资 {totalPlan}￥ </span>
                <span className='totalStyle'>已投资 {totalAmount}￥ </span>
                <span className='totalStyle'>总仓位 {totalPosition}% </span>
                <span className='totalStyle'>当前余额 {totalCurrent}￥ </span>
                <span className='totalStyle'>共盈利 {totalProfit}￥ </span>
                <span className='totalStyle'>整体收益率 {totalProfitRate}% </span>
                <ArgTable 
                    ref={tableRef}
                    tableType={'invest'}            
                    owncolumns = {columns()}
                    queryAction={getInvestedList}
                    getRowKeys={handleKeys}
                    params = {searchData} 
                    initMethod={initFunc}
                   
                /> 
                {/* baseProps={{ rowKey: record => record.id }} */}
            </section>
            {/* 添加理财记录抽屉  width={520}bodyStyle={{ padding: 40,}} */}
            <Drawer
                    title={investTitle}
                    placement="right"
                    onClose={onClose}
                visible={investOpen}
                className='investDrawer'
                    extra={
                        <Space>
                            <Button size="small" onClick={debounceInvestSubmit} type="primary"> 提交</Button>
                            <Button size="small" onClick={handleRed} className="investRedBtn">分红</Button>
                            {isAddFlag ===false && <Button size="small" onClick={handleProfit} className="investProfitBtn">更新收益</Button>}
                        </Space>
                    }
                >

                <Form  name="investForm"  form={form} initialValues={{'time':moment()}} labelCol={{span:8}}  size="middle"  autoComplete="off" >
                        <Form.Item style={{clear:'both'}} label="创建时间" name="time"  
                                    rules={[
                                        {required:true,message:'请选择创建时间'},
                                        
                                    ]}  >
                                    <DatePicker   format='YYYY-MM-DD' style={{ width: 100+'%' }} onChange={getTimeChange} placeholder="请选择创建时间" allowClear />
                        </Form.Item>
                        <Form.Item label="详情" name="description"   
                                    rules={[
                                        {required:true,message:'请输入详情'},
                                        
                                    ]} >
                                <Input  placeholder="请输入" allowClear   />
                        </Form.Item>
                        <Form.Item label="计划投资总额" name="plan"
                                rules={[
                                    {required:true,message:'请输入金额'},
                                
                                ]} >
                                <Input type="number" placeholder="请输入金额"  allowClear  />
                        </Form.Item>
                        <Form.Item label="已投金额" name="amount" >
                                <Input type="number" disabled  />
                        </Form.Item>
                        <Form.Item label="当前余额" name="current" >
                                <Input type="number" disabled />
                        </Form.Item>
                        <Form.Item label="补充描述" name="note" >
                                <TextArea row={1} placeholder="请输入补充描述，记录一段往事供将来回忆" />
                        </Form.Item>
                </Form>
                {isAddFlag === false && <Button size="small" onClick={handleSingleInvest} type="primary"> 买入或卖出</Button>}
           
                {isAddFlag === false && 
                <ArgTable 
                    ref={singleInvestRef}
                    title={defaultTitle}
                    tableType={'invest'}            
                    owncolumns = {singleInvestColumns()}
                    queryAction={getInvestedList} 
                    getRowKeys={handleSingleKeys}
                    initMethod={initFunc} />
                }
                {/* 嵌套买入卖出抽屉  width={320}bodyStyle={{ padding: 40, }} */}
                <Drawer
                    title={investSingleTitle}
                    placement="right"
                    onClose={onChildrenClose}
                    visible={investChildrenOpen}
                    forceRender
                    extra={
                        <Space>
                            <Button size="small" onClick={debounceInvestSingleSubmit} type="primary"> 提交</Button>
                        </Space>
                    }>

                    <Form  name="investSingleForm"  form={investSingleForm} initialValues={{'time':moment()}} labelCol={{span:6}}  size="middle"  autoComplete="off" >
                        <Form.Item style={{clear:'both'}} label="时间" name="time"  
                                    rules={[
                                        {required:true,message:'请选择时间'},
                                        
                                    ]}  >
                                    <DatePicker   format='YYYY-MM-DD' style={{ width: 100+'%' }} onChange={getInvestTimeChange} placeholder="请选择创建时间" allowClear />
                            </Form.Item>
                            <Form.Item label="投资项目" name="investName"  >
                                <Input disabled />
                                {/* value={inputVal} */}
                            </Form.Item>
                            <Form.Item label="操作" name="type" >
                                <Select placeholder="请选择"
                                    options={[{ value: 1, label: '买入' }, { value: 0, label: '卖出' }]} allowClear />
                            </Form.Item>
                            <Form.Item label="金额" name="amount"  rules={[  {required:true,message:'请输入金额'}, ]}>
                                    <Input type="number"  />
                            </Form.Item>
                            <Form.Item label="支付方式" name="paymentId" >
                                    <Select   onChange={paymentSingleTypeChange} placeholder="请选择" allowClear>
                                                {
                                                paymentTypeArray.map( (item,index,arr) => (
                                                
                                                    <Option key={item.id} value={item.id}>
                                                        {item.name}
                                                    </Option>
                                                ))
                                                }
                                        </Select>
                            </Form.Item>
                            <Form.Item label="补充描述" name="note" >
                                    <TextArea row={1} placeholder="请输入附加描述" />
                            </Form.Item>
                    </Form>
                </Drawer>
                {/* 添加分红记录弹窗 */}
                <AsyncModal title='添加分红记录' modalType={isModalType} vis={isRedVisible} isClosable={false} isFooter={typeFooter} operDialogFunc={operRedFunc} handleOk={debounceRedSubmit}>
                    <Form  name="redForm" form={redForm} initialValues={{'time':moment(),"dividentType":"CASH_OUT"}} labelCol={{span:4}}  size="middle"  autoComplete="off">
                        <Form.Item  label="分红方式" name="dividentType"  rules={[
                                        {required:true,message:'请选择分红方式'},
                                        
                                    ]} 
                            >
                            <Select  style={{ width: 100+'%' }} onChange={redChange} placeholder="请选择分红方式" allowClear >
                                    {
                                        redTypeArray.map( (item) => (
                                            <Option key={item.value} value={item.value}>
                                                {item.name}
                                            </Option>
                                        ))
                                    }
                            </Select>
                    </Form.Item>
                    {
                        redType === 'CASH_OUT' && ( <Form.Item label="分红日期" name="time"  
                                    rules={[
                                        {required:true,message:'请选择分红日期'},
                                        
                                    ]}  >
                                    <DatePicker   format='YYYY-MM-DD' style={{ width: 100+'%' }} onChange={getRedTimeChange} placeholder="请选择分红日期" allowClear />
                    </Form.Item>) }
                    {
                        redType === 'CASH_OUT' && (<Form.Item label="接收账户" name="paymentId"   rules={[ {required:true,message:'请选择'}, ]}> 
                                <Select   onChange={paymentTypeChange} placeholder="请选择" allowClear>
                                        {
                                        paymentTypeArray.map( (item,index,arr) => (
                                        
                                            <Option key={item.id} value={item.id}>
                                                {item.name}
                                            </Option>
                                        ))
                                        }
                                </Select>
                    </Form.Item>)}
                    {redType === 'CASH_OUT' && ( <Form.Item label="金额" name="amount"  ><Input type="number" placeholder="请输入" allowClear /></Form.Item>)}
                    {redType === 'RE_INVEST' &&(<Form.Item label="最新余额" name="latestAmount"  ><Input type="number" placeholder="请输入" allowClear /></Form.Item>)}
                    </Form>      
                </AsyncModal>
                {/* 更新收益弹窗 */}
                <AsyncModal title='更新收益' modalType={isProfitType} vis={isProfitVisible} isClosable={false} isFooter={typeFooter} operDialogFunc={operProfitFunc} handleOk={debounceProfitSubmit}>
                    <Form name="profitForm" form={profitForm} labelCol={{ span: 4 }} size="middle" autoComplete="off">
                        <Form.Item label="最新余额" name="newCurrent"  ><Input type="number" placeholder="请输入" allowClear /></Form.Item>
                    </Form>
                </AsyncModal>
            </Drawer>
        </div>
    )
    
}
export default  Invest;