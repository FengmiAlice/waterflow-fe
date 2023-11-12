import React, {useEffect,useState,useRef} from 'react';
import { getBudgetList, getConsumeTypeList, getBudgetStatistic,addType,addBudget,deleteBudget,closeBudget} from '../../api/user';
import { DatePicker,Form,Button,Input,message,Select,Space,Tooltip,Modal } from 'antd';
import ArgTable from '../../components/Table';
import AsyncModal from '../../components/Modal';
import moment from 'moment';
const { Option } = Select;
const { TextArea } = Input;
const {confirm} = Modal;

function Budge() {
      // 列表的column项配置
     const columns = ()=>{
        return [
            {
                title: '开始日期',
                key:'startTimeStr',
                dataIndex: 'startTimeStr',
               
            },
                {
                title: '截止日期',
                key:'endTimeStr',
                dataIndex: 'endTimeStr',
               
            },
            {
                title: '预算类别',
                key:'type',
                dataIndex: 'type',
                render: record => (
                    <>
                        {
                            selectedTypeArray.map( item =>{
                                if(item.key === record) {
                                    return (
                                        <Space  key={item.key}>
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
                title: '预算支出',
                key:'amount',
                dataIndex: 'amount',
            },
            {
                title: '实际支出',
                key:'actualAmount',
                dataIndex: 'actualAmount',
            },
            {
                title: '结余（正为超支）',
                key:'balance',
                dataIndex: 'balance',
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record,index) =>{
                    return (
                        <Space size="middle">
                              <div className='largeBtnBox'>
                                <Button size="small" type="primary"  onClick={ ()=> handleEdit(record)}>编辑</Button>
                                <Button size="small" type="danger" onClick={() => handleDelete(record)}>删除</Button>
                                <Button size="small" type="link"  onClick={ ()=> handleClose(record)}>结算</Button>
                              </div>
                              <div className="miniBtnBox">
                                <Button size="small" type="text" className='miniPrimaryBtn' onClick={ ()=> handleEdit(record)}>编辑</Button>
                                <Button size="small" type="text" danger onClick={() => handleDelete(record)}>删除</Button>
                                <Button size="small" type="link"  onClick={ ()=> handleClose(record)}>结算</Button>
                              </div>
                            
                        </Space>
                        ) 
                }
                
            }
        ];
    }
    const month=useRef('');//设置月份值
    const year = useRef('');//设置年份值
    const budgetType = useRef('');//设置搜索类别值
    const keyword = useRef('');//设置搜索关键字
    const searchScopeLevel = useRef(0);//默认设置搜索条件月度预算级别
    const tableRef = useRef(null);//设置表格的ref
    const addBudgetType = useRef('');//设置新类别值
    const scopeLevel = useRef(0);//默认设置新增编辑预算弹窗中月度预算级别0
    const budgetMonthTime = useRef();//默认选择月份
    const budgetYearTime = useRef();//默认选择年份
   
    const [form] = Form.useForm();//设置添加编辑预算form实例
    const [typeForm] = Form.useForm();//设置添加新类别form实例
    const [totalAmount,setTotalAmount] = useState(0);//设置预算总金额
    const [realAmount,setRealAmount] = useState(0);//设置预算实际金额
    const [restAmount,setRestAmount] = useState(0);//设置预算结余金额
    const [selectedDate, setSelectedDate] = useState();//设置日期选择器选择的值
    const budgetFooter = useState(true);//设置添加编辑预算弹窗是否显示底部按钮
    const typeFooter = useState(true);//设置新类别弹窗是否显示底部按钮
    const [budgetTypeArray, setBudgetTypeArray] = useState([]);//设置新增、编辑预算类别列表
    const [selectedTypeArray, setSelectedTypeArray] = useState([]);//设置搜索预算类别列表
    let initParamsData = {
        month:month.current,
        year:year.current,
        type:budgetType.current,
        keyword: keyword.current,
        scopeLevel:searchScopeLevel.current
    }
    const [searchData,setSearchData] = useState(initParamsData);//设置初始传参列表
    const [budgetTitle,setBudgetTitle] = useState('');//设置添加编辑预算弹窗title值
    const [isModalType, setIsModalType] = useState('');//设置添加编辑预算弹窗输出类型
    const [isModalVisible, setIsModalVisible] = useState(false);//设置是否显示添加编辑预算弹窗
    const [isTypeVisible, setTypeVisible] = useState('');//设置添加新类别弹窗是否显示
    const [isSpecialType, setIsSpecialType] = useState('');//设置添加新类别弹窗输出类型

    useEffect(() => {
            getBudgetTypeList();//获取预算类别数据
            getStatistics();//获取表格上方的统计金额数据
      
    }, [])
    // 获取预算类别列表
    function getBudgetTypeList(){
        let param={
            type:2
        }
        getConsumeTypeList(param).then((res)=>{
            if (res.data.success === true) {
                // console.log('类别列表',res.data.page.list)
                setBudgetTypeArray(res.data.page.list);
                setSelectedTypeArray(res.data.page.list);
            }
        }).catch((error)=>{
            console.log(error)
        })
    }
    // 获取搜索月份日期值
    function getMonthChange(date,dateString){
        // 非空判断
        dateString =dateString || '';
        month.current = dateString; 
    }
   // 获取年份日期值
   function getYearChange(date,dateString){
        // 非空判断
        dateString = dateString || '';
        year.current = dateString;
    }
    // 获取搜索时选择的预算类别值
    function typeChange(value, current) {
        if (value === undefined || value === '') {
            budgetType.current = '';
        }
        budgetType.current = value;
    }
    // 获取搜索时的输入框值
     function inputChange(e){
        keyword.current = e.target.value
    }
    // 搜索条件中的月度、年度预算选择事件
    function budgetLevelChange(k) {
        // console.log('搜索年度', k)
        searchScopeLevel.current = k;
    }
    // 新增编辑预算弹窗中的月度、年度预算选择事件，根据选择的预算级别，显示不同的日期选择组件
    function levelChange(v) {
        // 清空之前选中的日期值
        budgetYearTime.current = '';
        budgetMonthTime.current = '';
        // 赋值scopeLevel
        scopeLevel.current = v;
        // console.log('选择的level', v)
        // console.log('赋值的level', scopeLevel.current)
        // console.log('选择的月', budgetMonthTime.current)
        // console.log('选择的年', budgetYearTime.current)

        if (scopeLevel.current === 0) {
            budgetMonthTime.current = moment().format("YYYY-MM");//格式化当前月份
            setSelectedDate(moment(budgetMonthTime.current))
        }
        if (scopeLevel.current === 1) {
            budgetYearTime.current = moment().format("YYYY");//格式化当前年份
            setSelectedDate(moment( budgetYearTime.current))
        } 
    }
    const PickerWithType = ({ type, onChange }) => {
        if (type === 0) return <DatePicker picker='month' format={'YYYY-MM'} value={selectedDate} onChange={onChange}  style={{ width: 100 + '%' }} allowClear />;
        if (type === 1) return <DatePicker picker='year' format={'YYYY'} value={selectedDate} onChange={onChange} style={{ width: 100 + '%' }} allowClear />;
    };
    // 新增编辑预算选择时间事件,每次选择日期之前清空之前选择的值，并设置默认级别、时间
    function getLevelMonthOrYearChange(date, dateString) {
        // console.log('moment选择',date)
        // console.log('时间选择', dateString)
        // console.log('级别选择', scopeLevel.current)
        if (scopeLevel.current === 0) {
            budgetMonthTime.current = dateString;
            setSelectedDate(moment(budgetMonthTime.current))
        }
        if (scopeLevel.current === 1) {
            budgetYearTime.current = dateString;
            setSelectedDate(moment(budgetYearTime.current))
        }
    }
    // 获取添加编辑预算记录时选择的预算类别值
    function addTypeChange(value){
        if(value === undefined){
            addBudgetType.current = '';
        }else{
            addBudgetType.current = value;
        }
    }
    // 添加新类别按钮事件
    function addNewType(){
        operTypeFunc(true);
        setIsSpecialType('special');
        typeForm.resetFields(); 
    }
    // 删除预算按钮事件
    function handleDelete(row) { 
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
                deleteBudget(par).then((res)=>{
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
       // 关闭预算按钮事件
    function handleClose(row) { 
       // confirm弹框
        confirm({
            title: '确认关闭此结算?',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消', 
            // confirm弹框内确认按钮事件
            onOk() {
                let par = {
                    id: row.id,
                    actualAmount:realAmount,
                };
                closeBudget(par).then((res)=>{
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
    // 设置查询条件初始化
    function initFunc(){
        // console.log('父组件执行初始化')  
    }
    // 添加预算按钮事件
    function handleAdd() {
        // 清空上一次填写的表单记录
        addBudgetType.current = '';
        scopeLevel.current = 0;//重置为0
        budgetMonthTime.current = moment().format('YYYY-MM');//重置为当月
        //  console.log('新增时',scopeLevel.current)
        // console.log('新增时', budgetMonthTime.current)
        setSelectedDate(moment(budgetMonthTime.current));//默认显示当月
        // 重置表单
        form.resetFields();

        setBudgetTitle('添加预算记录');
        setIsModalType('common')
        operDialogFunc(true);  
    }
    // 编辑预算按钮事件
    function handleEdit(row) { 
        // console.log('编辑预算', row)
        // console.log('编辑级别',scopeLevel.current)
        // console.log(row.timeFormat)
        scopeLevel.current = row.scopeLevel;
        row.timeFormat = moment(row.timeFormat);
        setSelectedDate(row.timeFormat);//赋值显示在日期组件上
        
        if (scopeLevel.current === 0) {
            budgetMonthTime.current = row.timeFormat.format('YYYY-MM'); 
        }
        if (scopeLevel.current === 1) {
            budgetYearTime.current = row.timeFormat.format('YYYY');
        }
        form.setFieldsValue(row);
        setBudgetTitle('编辑预算记录');
        setIsModalType('common')
        operDialogFunc(true);  
    }

    // 添加或编辑预算弹窗确定按钮提交事件
    async function handleSubmit() {
        try {
            const values = await form.validateFields();
            // console.log('提交表单数据', values)
            if (values) {
                let params;
                if (values.scopeLevel === 0) {
                    params = {
                        type: values.type,
                        timeFormat: budgetMonthTime.current,
                        description: values.description,
                        scopeLevel: values.scopeLevel,
                        amount: values.amount,
                    }
                }
                if (values.scopeLevel === 1) {
                    params = {
                        type: values.type,
                        timeFormat: budgetYearTime.current,
                        description: values.description,
                        scopeLevel: values.scopeLevel,
                        amount: values.amount,
                    }
                }
                addBudget(params).then((res) => {
                     if(res.data.success === true){
                        buttonSearch();//重新掉接口刷新表格数据
                        message.success(res.data.message);
                        operDialogFunc(false);
                    }else{
                        operDialogFunc(true);
                    }
                }).catch((error) => {
                    console.log(error)
                })
            }
            
        } catch (error) {
            console.log('validate failed',error)
        }
    }
    // 添加新类别弹窗确定按钮事件
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
                        getBudgetTypeList();//重新掉接口刷新类别列表数据
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
    // 设置新增编辑支出弹窗显示隐藏事件
    const operDialogFunc = (flag)=>{
        setIsModalVisible(flag);
    }
    // 设置新增类别弹窗显示隐藏事件
    const operTypeFunc = (flag)=>{
        setTypeVisible(flag)
    }
     // 获取预算总金额、实际金额、结余金额
    function getStatistics() {
        let params = {
            month:month.current, 
            year:year.current,
            type:budgetType.current,
            keyword:keyword.current, 
            scopeLevel: searchScopeLevel.current
        }
        getBudgetStatistic(params).then((res) => {
            if (res.data.success === true) {
                setTotalAmount(res.data.obj.totalAmount);
                setRealAmount(res.data.obj.totalActual);
                setRestAmount(res.data.obj.totalBalance);
            }
        }).catch((error) => {
            console.log(error)
        })
    }
    // 根据筛选条件搜索表格数据
    function buttonSearch(){
        // 每次翻页查询之后页码，条数重置
        if(tableRef.current){
            tableRef.current.resetPage();
        }
        setSearchData({
            month:month.current,
            year:year.current,
            type:budgetType.current,
            keyword: keyword.current,
            scopeLevel:searchScopeLevel.current
        })
        getStatistics();//获取表格上方各类金额数据
    }

    return (
        <div>
            <header className='searchFormHeader'>
                <Form  className="incomeWrap" layout="inline" initialValues={{'searchScopeLevel':0}} name="Income"  size="small"  >
                        <Form.Item label="月份选择" name="month">
                            <DatePicker  format='YYYY-MM' picker="month" onChange={getMonthChange} placeholder="请选择月份" allowClear/>
                        </Form.Item>
                        <Form.Item label="年份选择" name="year">
                            <DatePicker  format='YYYY' picker="year"  onChange={getYearChange} placeholder="请选择年份" allowClear/>
                        </Form.Item>
                        <Form.Item label="类别" name="type">
                            <Select style={{ width: 120 }} onChange={typeChange}  placeholder='请选择类别' allowClear>
                                    {
                                        selectedTypeArray.map( (item,index,arr) => (
                                            <Option key={item.id} value={item.key}>
                                                {item.name}
                                            </Option>
                                        ))
                                    }
                            </Select>
                        </Form.Item>
                        <Form.Item label="预算级别" name="searchScopeLevel">
                            <Select style={{ width: 120 }} onChange={budgetLevelChange} options={[ { value: '', label: '查看全部'},{ value: 0, label: '只看月度预算'},{ value: 1,  label: '只看年度预算'} ]} allowClear  placeholder='请选择预算级别'/>
                        </Form.Item>
                        <Form.Item  label="关键字" name="keyword">
                            <Input  placeholder="请输入关键字" allowClear  onChange={(e)=>inputChange(e)}  />
                        </Form.Item>
                        <Form.Item  >
                            <Button size="small" type="primary" className="searchBtn" onClick={buttonSearch} > 搜索</Button>
                        </Form.Item>
                </Form>
            </header>
            <section>
                 <Tooltip title="添加一条预算记录，对这个月的预算有个基本掌握" placement="top">
                    <Button size="small" type="primary" className="addConsumeBtn"  onClick={handleAdd} >新增预算</Button>
                </Tooltip>
                <span className='totalStyle'>预算金额总计 {totalAmount}￥ </span>
                <span className='totalStyle'>实际金额总计 {realAmount}￥ </span>
                <span className='totalStyle'>结余金额总计 {restAmount}￥ </span>
                <ArgTable 
                    ref={tableRef}
                    tableType={'budget'}
                    owncolumns = {columns()}
                    queryAction={getBudgetList}
                    baseProps={{ rowKey: record => record.id }}
                    params = {searchData} 
                    initMethod={initFunc}
                    
                />         
                {/* 添加或编辑预算记录弹窗 */}
                <AsyncModal title={budgetTitle}  modalType={isModalType} vis={isModalVisible} isClosable={false} isFooter={budgetFooter} operDialogFunc={operDialogFunc} handleOk={handleSubmit}>
                    <section >
                        <Form name="budgetForm"  form={form} initialValues={{'scopeLevel':0,'timeFormat':moment()}} labelCol={{span:5}}  size="middle"  autoComplete="off" >
                            <Form.Item  label="预算类别" >
                                <Form.Item  name="type"  rules={[ {required:true,message:'请选择预算类别'}, ]} noStyle>
                                    <Select className='consumeTypeSelect'  onChange={addTypeChange} placeholder="请选择预算类别" allowClear >
                                            {
                                                budgetTypeArray.map( (item,index,arr) => (
                                                    <Option key={item.id} value={item.key}>
                                                        {item.name}
                                                    </Option>
                                                ))
                                            }
                                    </Select>
                                </Form.Item>    
                                <Button  type="primary" onClick={addNewType} className="consumeTypeButton">新类别</Button>   
                            </Form.Item>
                             <Form.Item label="预算级别" name="scopeLevel"   
                                    rules={[
                                        {required:true,message:'请选择预算级别'},
                                        
                                    ]}> 
                                <Select placeholder="请选择预算级别" value={scopeLevel.current} onChange={levelChange} options={[ { value: 0, label: '月度预算'},{ value: 1,  label: '年度预算'} ]} allowClear />
                            </Form.Item>
                            <Form.Item style={{clear:'both'}} label="时间" name="timeFormat"  
                                    rules={[
                                        {required:true,message:'请选择时间'},
                                        
                                ]} >
                                 <PickerWithType type={scopeLevel.current} onChange={getLevelMonthOrYearChange} />
                                 {/* <DatePicker  key={key} value={selectedDate}  format={scopeLevel.current === 0 ? 'YYYY-MM' : 'YYYY'}
                                 picker={scopeLevel.current === 0 ? 'month' : 'year'}   onChange={getLevelMonthOrYearChange} style={{ width: 100 + '%' }} /> */}
                            </Form.Item>
                             <Form.Item label="金额(圆整)" name="amount" 
                                rules={[
                                    {required:true,message:'请输入金额'},
                                
                                ]} >
                                <Input type="number" placeholder="越精确越好，可以写小数"    />
                            </Form.Item>
                            <Form.Item label="详情" name="description" >
                                <Input  placeholder="购买了什么，或者去哪玩了"  allowClear  />
                            </Form.Item>
                        </Form>
                    </section>
                </AsyncModal>
                 {/* 添加新类别弹窗 */}
                <AsyncModal title='添加类型' modalType={isSpecialType} vis={isTypeVisible} isClosable={false} isFooter={typeFooter} operDialogFunc={operTypeFunc} handleOk={handleTypeSubmit}>
                    <Form  name="typeForm" form={typeForm}  labelCol={{span:4}}  size="middle"  autoComplete="off">
                        <Form.Item  label="名称" name="typeName"  
                            rules={[
                                        {required:true,message:'请输入名称'},
                                        
                            ]}
                            >
                            <Input type="text" placeholder="请输入名称" allowClear />
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
export default Budge;