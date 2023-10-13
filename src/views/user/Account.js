import React, {useEffect,useState,useRef} from 'react';
import ArgTable from '../../components/Table';
import AsyncModal from '../../components/Modal';
import { Form,Button,Input,Select,Space,message,Modal} from 'antd';
import { getStatistics,getAccountList,deleteAccountById,addAccounts} from '../../api/user';
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
                                <Button size="small" type="danger"  onClick={ ()=> handleDelete(record)}>删除</Button>
                            </div>
                            <div className="miniBtnBox">
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
            keyword:'',
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
    // const [paymentTypeArray,setPaymentTypeArray] = useState([]);//设置支付方式列表
    // 使用useForm创建新增支出记录form实例
    const [form] = Form.useForm();
    // 使用useForm创建新增支出类别form实例
    // const [typeForm] = Form.useForm();

    
    const consumeFooter = useState(true);//设置添加编辑支出类弹窗是否显示底部按钮
    // const typeFooter = useState(true);//设置新类别弹窗是否显示底部按钮
    const [isModalVisible, setIsModalVisible] = useState(false)//设置添加账户类弹窗
    // const [isTypeVisible,setTypeVisible] = useState(false);//设置新类别弹窗
    const [accountTitle,setAccountTitle] = useState('');//设置添加账户弹框title值
    const [isModalType,setIsModalType] = useState('');//设置弹窗输出类型

    const [rowId,setRowId] = useState('');//设置新增或删除需要传递的行id

    const [totalEntity,setTotalEntity] = useState(0);//统计账户储蓄
    const [totalInvest,setTotalInvest] = useState(0);//统计账户理财
    const [totalDebt,setTotalDebt] = useState(0);//统计账户债务
    const [totalOther,settotalOther ] = useState(0);//统计账户其他
    const [totalAmount,setTotalAmount] = useState(0);//统计账户总计
    // const [rowKeys,setRowKeys] = useState([]);//设置表格选择的数据


    // 搜索条件的一些参数获取
    // const month = useRef();//设置月份
    // const year = useRef();//设置年份
    // const times = useRef();//设置时间选择
    const accountType= useRef('');//设置搜索账户类别值
    // const paymentType = useRef('');//设置搜索支付方式值
    const keyword = useRef('');//设置搜索关键字值
    const addAccountType = useRef('');//设置新增账户类别值
    // const addPaymentType= useRef('');//设置新增支出记录支付方式值

    // const tableIds = useRef('account_report');//获取账户列表table id
    const tableRef = useRef(null);//设置表格的ref

    // let curTime= moment().format("YYYY-MM-DD");
    // const consumeTime = useRef(curTime);//设置支出记录默认时间
    //在页码或者页数变化的时候更新（在组件挂载和卸载时执行，传一个空数组，只执行一次）
       useEffect(()=>{
                // month.current = moment().format("YYYY-MM");//格式化当前月份
                getStatisticData();
                // getTypeList();
                // getPaymentList();
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
   
    // 获取搜索账户类别值
    function typeChange(value, current) {
        accountType.current = value;
    }
     // 获取账户类别值
    function addTypeChange(value,current){
        addAccountType.current = 1;
    }

    // 获取搜索输入框值
    function inputChange(e){
        keyword.current = e.target.value
    }

    // // 添加新类别按钮事件
    // function addNewType(){
    //     operTypeFunc(true);
    //     setIsModalType('special');
    //     typeForm.resetFields();
       
    // }
    // 添加类别弹窗提交按钮事件
    // function handleTypeSubmit(){
    //     typeForm.validateFields().then(async (values) => {
    //         let params = {
    //             type:2,
    //             name:values.typeName,
    //             description:values.typeDescription,
              
    //         };
    //         let res = await addType(params);
    //         if(res.data.success === true){
    //             getTypeList();//重新掉接口刷新类别列表数据
    //             message.success("添加新类别成功");
    //             operTypeFunc(false);
    //         }else{
    //             operTypeFunc(true);
    //         }
    //     }).catch((error)=>{
        //     console.log(error)
        // })
    // }


    // 添加账户按钮事件
    function handleAdd(){
        // 置空表单数据
        // addAccountType.current = '';
        // addPaymentType.current = '';
        form.resetFields();
        setAccountTitle('新增账户');
        setIsModalType('common');
        setRowId('');
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

    // 批量删除表格行数据
    // function handleDeleteRow(){
    //     if(rowKeys.length === 0){
    //         message.warning('请选择删除的数据');
    //         return;
    //     }
    //     // 弹框
    //     confirm({
    //         title: '确认删除?',
    //         okText: '确认',
    //         okType: 'danger',
    //         cancelText: '取消',
    //         // 点击确认触发
    //         onOk() {
    //             let param={
    //                 idList:rowKeys
    //             }
    //             deleteTableRowArray(param).then((res)=>{
    //                 if(res.data.success === true){
    //                     message.success(res.data.message);
    //                     buttonSearch();//重新掉接口刷新表格数据
    //                     setRowKeys([]);//清空选择的数据
    //                 }
    //             }).catch((error)=>{
        //     console.log(error)
        // })
    //         }
    //     });
    // }



    // 添加账户弹窗信息确认操作
    function handleSubmit(){
        form.validateFields().then(async (values) => {
            // 将时间组件值转为字符串用于传值
            // let times;
            // if(values.time !== undefined){
            //     times = values.time.format('YYYY-MM-DD');
            // }
            // console.log(values)
            let params = {
                id:rowId,
                types:values.types,//addAccountType.current
                amount:values.amount,
                note:values.note
            };
            let res = await addAccounts(params);
            if(res.data.success === true){
                buttonSearch();//重新掉接口刷新表格数据
                message.success(res.data.message);
                operDialogFunc(false);
            }else{
                operDialogFunc(true)
            }
        }).catch((error)=>{
            console.log(error)
        })
    }

    // 设置账户弹窗显示隐藏事件
    const operDialogFunc = (flag)=>{
        setIsModalVisible(flag);
       
    }
     // 设置新增类别弹窗显示隐藏事件
    // const operTypeFunc = (flag)=>{
    //     setTypeVisible(flag)
    // }

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
            <Form  className="consumeWrap" layout="inline" name="Consume"  size="small">
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
            <Button type="primary" size="small" className="addConsumeBtn"   >转账</Button>
            {/* <Tooltip title="把符合以上搜索条件的（或已勾选的）记录导出成一个Excel表格文件" placement="top">
                <Button type="ghost"   className="exportConsumeBtn"  onClick={handleExport}>导出</Button>
            </Tooltip> */}
            {/* <Tooltip title="删除你勾选的所有记录，不要随便点哦，删除就没啦" placement="top">
                <Button type="danger"  className="deleteConsumeBtn" onClick={handleDeleteRow} >删除 </Button>
            </Tooltip> */}
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

            {/* 添加账户弹窗 */}
            <AsyncModal title={accountTitle}  modalType={isModalType} vis={isModalVisible} isClosable={false} isFooter={consumeFooter} operDialogFunc={operDialogFunc} handleOperate={handleSubmit}>
                <section >
                    <Form   name="consumeForm"  form={form}  labelCol={{span:5}}  size="middle"  autoComplete="off">
                        <Form.Item label="名称" name="name"    >
                            <Input  placeholder="请输入账户名称"    />
                        </Form.Item>
                        <Form.Item label="金额(圆整)" name="amount">
                            <Input type="number" placeholder="越精确越好，可以写小数"    />
                        </Form.Item>
                        <Form.Item  label="账户类型" name="types"  rules={[
                                {required:true,message:'请选择账户类型'},
                            
                            ]} style={{position:'relative'}} initialValue={'1'}>
                                <Select style={{width:80+'%'}}  onChange={addTypeChange} placeholder="请选择" allowClear >
                                    <Option key="1" value="1">
                                        储蓄
                                    </Option>
                                </Select>
                        </Form.Item>
                        <Form.Item label="补充描述" name="note" >
                            <TextArea row={1} placeholder="请输入附加描述" />
                        </Form.Item>
                    </Form>
                </section>
            </AsyncModal>
            
            {/* 添加类别弹窗 */}
            {/* <AsyncModal title='添加类型' modalType={isModalType} vis={isTypeVisible} isClosable={false} isFooter={typeFooter} operDialogFunc={operTypeFunc} handleOperate={handleTypeSubmit}>
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
            </AsyncModal> */}
       </section>
    </div>
    )
}
export default Account;