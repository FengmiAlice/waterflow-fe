import React, {useEffect,useState,useRef} from 'react';
import ArgTable from '../../components/Table';
import AsyncModal from '../../components/Modal';
import {useNavigate} from 'react-router-dom';
import { Form,Button,Input,Select,Space,message,Modal} from 'antd';
import { getStatistics,getAccountList,deleteAccountById,addAccount,transformAccount} from '../../api/user';
const { Option } = Select;
const {confirm} = Modal;
const {TextArea} = Input;

function Account(){
    const columns = ()=>{
        return [
            {
                title:'创建日期',
                key:'createTime',
                dataIndex:'createTime',
            },
            {
                title:'名称',
                key:'name',
                dataIndex:'name',
            },
            {
                title:'类型',
                key:'types',
                dataIndex:'types',
            },
           
            {
                title: '金额',
                key:'amount',
                dataIndex: 'amount',
            },
           
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record,index) =>{
                    return(
                        <Space size="middle">
                            <div className='largeBtnBox'>
                                <Button size="small" type="primary"  onClick={ ()=> handleEdit(record)}>编辑</Button>
                                <Button size="small" type="danger"  onClick={ ()=> handleDelete(record)}>删除</Button>
                            </div>
                            <div className="miniBtnBox">
                                <Button size="small" type="text" className='miniPrimaryBtn' onClick={ ()=> handleEdit(record)}>编辑</Button>
                                <Button size="small" type="text" danger onClick={ ()=> handleDelete(record)}>删除</Button>
                            </div> 
                        </Space>
                    )
                }    
            }
        ];
    }

    // 获取store中的用户信息
    // const { userStore } = useStore()
    // const { userInfo } = userStore;
    // let currentMonth =  moment().format("YYYY-MM");
    let initSearchData = {
        types:'',
        keyword: '',
        pageNum:'',
    }
    const [searchData,setSearchData] = useState(initSearchData);//设置初始传参列表
    //设置账户类别列表
    const selectedTypeArray=[
        {name:'全部',value:''},
        {name:'储蓄',value:1},
        {name:'理财',value:2},
        {name:'债务',value:3},
        {name:'其他',value:-1},
    ]
    // 使用useForm创建新增账户类别form实例
    const [form] = Form.useForm();
    const [softForm] = Form.useForm();
    const consumeFooter = useState(true);//设置添加编辑账户类别弹窗是否显示底部按钮
    const [isModalVisible, setIsModalVisible] = useState(false)//设置添加或编辑账户类弹窗是否显示
    const [accountTitle,setAccountTitle] = useState('');//设置添加账户弹窗title值
    const [isModalType,setIsModalType] = useState('');//设置添加账户弹窗输出类型
    const [rowId,setRowId] = useState('');//设置新增或删除需要传递的行id
    const [totalEntity,setTotalEntity] = useState(0);//统计账户储蓄
    const [totalInvest,setTotalInvest] = useState(0);//统计账户理财
    const [totalDebt,setTotalDebt] = useState(0);//统计账户债务
    const [totalOther,settotalOther ] = useState(0);//统计账户其他
    const [totalAmount, setTotalAmount] = useState(0);//统计账户总计
    const [typeDisabled, setTypeDisabled] = useState(false);//编辑账户时是否设置禁选
    // const [rowKeys,setRowKeys] = useState([]);//设置表格选择的数据
    const [softModal, setSoftModal] = useState('');//设置转账弹窗输出类型
    const [softVisible, setSoftVisible] = useState(false);//设置转账弹窗是否显示
    const [userArray, setUserArray] = useState([]);//设置支出账户列表

    // 搜索条件的一些参数获取
    const accountType= useRef('');//设置搜索账户类别值
    const keyword = useRef('');//设置搜索关键字值
    const addAccountType = useRef('1');//初始默认设置新增账户类别值为储蓄1
    const tableRef = useRef(null);//设置表格的ref
    const navigate = useNavigate();
    //在页码或者页数变化的时候更新（在组件挂载和卸载时执行，传一个空数组，只执行一次）
       useEffect(()=>{
                // month.current = moment().format("YYYY-MM");//格式化当前月份
                getStatisticData();
                getLists();//获取账户列表

       },[])
 

    // 设置表格选择的数据
    // function handleKeys(val){
    //     setRowKeys(val)
    // }
    
    // 设置查询条件初始化
    function initFunc(){
        // console.log('父组件执行初始化')
        
    }
    // 获取账户统计数据
    function getStatisticData(){
        let params={};
        getStatistics(params).then((res)=>{
            if(res.data.success === true){
                setTotalEntity(res.data.obj.totalEntity);
                setTotalInvest(res.data.obj.totalInvest);
                setTotalDebt(res.data.obj.totalDebt);
                settotalOther(res.data.obj.totalOther);
                setTotalAmount(res.data.obj.totalAmount)
            }
        }).catch((error)=>{
            console.log(error)
        })
    }
  
   // 获取账户列表，用于转账选择账户
    function getLists() {
        let params = {
            pageNum: 0,
            types:1,
        }
        getAccountList(params).then( (res) => {
            if(res.data.success === true){
                setUserArray(res.data.page.list)
             
            }
        }).catch((error)=>{
            console.log(error)
        })
    }

    // 获取搜索账户类别值
    function typeChange(value, current) {
        accountType.current = value;
    }
     // 获取账户类别值
    function addTypeChange(value, current) {
        addAccountType.current = value;
    }

    // 获取搜索输入框值
    function inputChange(e){
        keyword.current = e.target.value
    }

    // 添加账户按钮事件
    function handleAdd(){
        form.resetFields();
        setAccountTitle('新增账户');
        setTypeDisabled(false);
        setIsModalType('common');
        setRowId('');
        operDialogFunc(true);  
    }
    // 编辑账户按钮操作
    function handleEdit(row) {
        // console.log('编辑账户',row)
        // 表单赋值显示
        form.setFieldsValue(row);
        // 重新给addAccountType赋值类别值
        if (row.types === '储蓄') {
            addAccountType.current = 1;
        } else if (row.types === '理财') { 
            addAccountType.current = 2;
        } else if (row.types === '债务') { 
            addAccountType.current = 3;
        } else if (row.types === '其他') {
            addAccountType.current = -1;
        } else {
            addAccountType.current ='';
        }
        setAccountTitle('编辑账户');
        setTypeDisabled(true);
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
                deleteAccountById(par).then((res)=>{
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

    // 添加账户弹窗信息确认操作
    async function handleSubmit() {
        try {
            const values = await form.validateFields();
            // console.log('账户提交', values)
            // console.log(addAccountType.current)
            if (values) {
                let params = {
                    id: rowId,
                    name:values.name,
                    types:addAccountType.current,
                    amount:values.amount,
                    note:values.note
                };
                addAccount(params).then((res) => {
                    if(res.data.success === true){
                        buttonSearch();//重新掉接口刷新表格数据
                        message.success(res.data.message);
                        operDialogFunc(false);
                    }else{
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

    // 设置账户弹窗显示隐藏事件
    const operDialogFunc = (flag)=>{
        setIsModalVisible(flag);
    }

    // 设置转账弹窗显示隐藏事件
    const operSoftDialogFunc = (flag)=>{
        setSoftVisible(flag);
    }

    // 转账按钮事件
    function handleTurn() {
        softForm.resetFields();
        setSoftModal('common');
        operSoftDialogFunc(true);  
    }

    // 余额按钮事件
    function turnSoft() {
        navigate('/index/accountReport')
    }

    // 转账弹窗信息确认操作
    async function handleTurnSubmit() {
          try {
            const values = await softForm.validateFields();
            // console.log('转账',values)
            if (values) {
                // 将时间组件值转为字符串用于传值
                // let times;
                // if(values.time !== undefined){
                //     times = values.time.format('YYYY-MM-DD');
                // }
                let params = {
                    fromId:values.fromId,
                    toId:values.toId,
                    amount:values.amount,
                };
                transformAccount(params).then((res) => {
                    if(res.data.success === true){
                        buttonSearch();//重新掉接口刷新表格数据
                        message.success(res.data.message);
                        operSoftDialogFunc(false);
                    }else{
                        operSoftDialogFunc(true)
                    }
                }).catch((error) => {
                    console.log(error)
                })
            }
        } catch (error) {
            console.log('validate failed',error)
        }
    }

    // 根据筛选条件搜索表格数据
    function buttonSearch(){
        // 每次翻页查询之后页码，条数重置
        if(tableRef.current){
            tableRef.current.resetPage()
        }
       
        setSearchData({
            types:accountType.current,
            keyword:keyword.current,
        })
    }

    return(
    <div>
        <header className='searchFormHeader'>
            <Form  className="accountWrap" layout="inline" name="Consume"  size="small">
                    <Form.Item label="类别" name="types" initialValue={''}>
                        <Select style={{ width: 120 }}  onChange={typeChange} allowClear={true} >
                                {
                                    selectedTypeArray.map( (item) => (
                                        <Option key={item.value} value={item.value}>
                                            {item.name}
                                        </Option>
                                    ))
                                }
                        </Select>
                    </Form.Item>
                    <Form.Item  label="关键字" name="keyword">
                        <Input  placeholder="请输入关键字" allowClear  onChange={(e)=>inputChange(e)}  />
                    </Form.Item>
                    <Form.Item  >
                        <Button size="small" type="primary" onClick={buttonSearch} > 搜索</Button>
                    </Form.Item>
            </Form>
        </header>
       <section>
            <Button type="primary" size="small" className="addConsumeBtn"  onClick={handleAdd} >新增账户</Button>
            <Button type="primary" size="small" className="addConsumeBtn" onClick={handleTurn}>转账</Button>
            <Button type="primary" size="small" className="addConsumeBtn"  onClick={turnSoft}>统计图表</Button>
            <span className='totalStyle'>储蓄：{totalEntity}￥ </span>
            <span className='totalStyle'>理财：{totalInvest}￥ </span>
            <span className='totalStyle'>债务：{totalDebt}￥ </span>
            <span className='totalStyle'>其他：{totalOther}￥ </span>
            <span className='totalStyle'>总计：{totalAmount}￥ </span>
            <ArgTable 
                ref={tableRef}
                tableType={'account'}            
                owncolumns = {columns()}
                queryAction={getAccountList}
                baseProps={{ rowKey: record => record.id }}
                params = {searchData} 
                initMethod={initFunc}
         
                
            />                           
            {/* getRowKeys={handleKeys} */}
            {/* 添加或编辑账户弹窗 */}
            <AsyncModal title={accountTitle}  modalType={isModalType} vis={isModalVisible} isClosable={false} isFooter={consumeFooter} operDialogFunc={operDialogFunc} handleOk={handleSubmit}>
                <section >
                    <Form   name="accountForm"  form={form}  labelCol={{span:5}}  size="middle"  autoComplete="off">
                        <Form.Item label="名称" name="name"   rules={[ {required:true,message:'请输入账户名称'}, ]}  >
                            <Input  placeholder="请输入账户名称"   allowClear />
                        </Form.Item>
                        <Form.Item label="金额(圆整)" name="amount"  rules={[{ required: true, message: '请输入金额' },]}>
                            <Input type="number" placeholder="越精确越好，可以写小数"  allowClear  />
                        </Form.Item>
                        <Form.Item label="账户类型" name="types"  rules={[{ required: true, message: '请选择账户类型' },]} style={{ position: 'relative' }} initialValue={'1'}>
                                <Select placeholder="请选择账户类型" allowClear onChange={addTypeChange} disabled={typeDisabled}
                                    options={[ {   value: '1',  label: '储蓄', }, ]}>
                                </Select>
                        </Form.Item>
                        <Form.Item label="补充描述" name="note" >
                            <TextArea row={1} placeholder="请输入附加描述" />
                        </Form.Item>
                    </Form>
                </section>
            </AsyncModal>
            {/* 转账弹窗 */}
            <AsyncModal title="转出余额?"  modalType={softModal} vis={softVisible} isClosable={false} isFooter={consumeFooter} operDialogFunc={operSoftDialogFunc} handleOk={handleTurnSubmit}>
                <section >
                    <Form   name="softForm"  form={softForm}  labelCol={{span:5}}  size="middle"  autoComplete="off">
                        <Form.Item label="转出账户" name='fromId' rules={[{ required: true, message: '请选择转出账户' },]}>
                            <Select   placeholder="请选择转出账户" allowClear >
                                    {
                                    userArray.map( (item,index,arr) => (
                                    
                                        <Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Option>
                                    ))
                                    }
                            </Select>
                        </Form.Item>
                        <Form.Item label="转入账户" name='toId' rules={[{ required: true, message: '请选择转入账户' },]}>
                            <Select    placeholder="请选择转入账户" allowClear >
                                    {
                                    userArray.map( (item,index,arr) => (
                                    
                                        <Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Option>
                                    ))
                                    }
                            </Select>
                        </Form.Item>
                        <Form.Item label="金额(圆整)" name="amount"  rules={[{ required: true, message: '请输入金额' },]}>
                            <Input type="number"  placeholder="越精确越好，可以写小数" allowClear />
                        </Form.Item>
                    </Form>
                </section>
            </AsyncModal>
       </section>
    </div>
    )
}
export default Account;