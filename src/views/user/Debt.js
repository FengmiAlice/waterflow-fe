import React, {useEffect,useState,useRef} from 'react';
import ArgTable from '../../components/Table';
import {useNavigate} from 'react-router-dom';
import {Form,Button,Input,Select,Space,message,Modal} from 'antd';
import { getDebtList, deleteDebt } from '../../api/user';
import {debounce} from '../../utils/appTools';
const { Option } = Select;
const {confirm} = Modal;


function Debt() {
    // 表格列设置
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
                title: '相关人',
                key:'owner',
                dataIndex: 'owner',
            },
            {
                title: '借入/出金额',
                key:'amount',
                dataIndex: 'amount',
                sorter:true
                
            },
            {
                title: '已还金额',
                key:'repay',
                dataIndex: 'repay',
                sorter:true
            },
            {
                title: '剩余金额',
                key:'balance',
                dataIndex: 'balance',
                sorter:true
                
            },
            {
                title: '状态',
                key:'status',
                dataIndex: 'status',
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record,index) =>{
                    return(
                        <Space size="middle" >
                            <div className='largeBtnBox'>
                                <Button size="small" type="primary" onClick={() => handleEdit(record)}>编辑</Button>
                                <Button size="small" type="danger"   onClick={ ()=> handleDelete(record)}>删除</Button>
                            </div>
                            <div className="miniBtnBox">
                                <Button size="small" type="text"  className='miniPrimaryBtn' onClick={ ()=> handleEdit(record)}>编辑</Button>
                                <Button size="small" type="text" danger onClick={() => handleDelete(record)}>删除</Button>
                            </div>
                        </Space>
                    )
                }    
            }
        ];
    }

    let initSearchData = {
            status:'',
            keyword:'',
    }
    const [searchData,setSearchData] = useState(initSearchData);//设置初始传参列表
    const [totalAmount,setTotalAmounts] = useState(0);//设置表格总花费
    const [rowKeys,setRowKeys] = useState([]);//设置表格选择的数据
   
    // 搜索条件的一些参数获取
    const status = useRef('');//设置搜索状态值
    const keyword = useRef('');//设置搜索关键字值
    const tableRef = useRef(null);//设置表格的ref
    const navigate = useNavigate();

    //设置债务状态列表
    const selectedStatusArray=[
        {name:'全部',value:''},
        {name:'偿还中',value:0},
        {name:'已偿还',value:1},
        {name:'呆账',value:2},
        {name:'坏账',value:3},
    ]
   

    //在页码或者页数变化的时候更新（在组件挂载和卸载时执行，传一个空数组，只执行一次）
       useEffect(()=>{
            //    getPaymentList();
       },[])
    
     // 获取支出方式列表
    // function getPaymentList(){
    //     getPaymentTypeList().then( (res) => {
    //         if(res.data.success === true){
    //             setPaymentTypeArray(res.data.page.list)
    //         }
    //     }).catch((error)=>{
    //         console.log(error)
    //     })
    // }
    // 设置表格总花费方法
    function setMount(k){   
        setTotalAmounts(k);
    }

    // 设置表格选择的数据
    function handleDebtKeys(val){
        setRowKeys(val)
    }

    // 设置查询条件初始化
    function initFunc(){
        // console.log('父组件执行初始化')  
    }

    // 状态选择事件
    function statusChange(value){
        if(value === undefined){
            status.current = '';
        }else{
            status.current = value;
        }
    }

    // 债务记录输入框事件
    function inputChange(e){
        keyword.current = e.target.value
    }

    // 添加债务记录按钮事件
    function handleAdd() {
        navigate('/index/debt/debtAdd');
        // 置空表单数据
        // setAddFlag(true);
        // if (isAddFlag === true) {
        //     // console.log(isAddFlag,1111)
        //     createTime.current = moment().format("YYYY-MM-DD")
        // }
        // form.resetFields();
        // setDebtTitle('添加债务记录');
        // setIsModalType('common');
        // setRowId('');
        // operDialogFunc(true);  
    }

    // 编辑债务记录按钮操作
    function handleEdit(row) {
        // console.log('债务记录编辑', row);
        let rowParam = JSON.stringify(row);
        // searchParams传参
        navigate(`/index/debt/debtEdit?debtRow=${rowParam}`);
        // state传参、路由事件跳转，传的参数放入state中,相当于sessionStorage
        // navigate('/index/debt/debtEdit',{state:{rowParam}} );
        
        // setAddFlag(false);
        // if (isAddFlag === false) {
        //     //  console.log(isAddFlag,2222)
        //     // createTime.current = row.timeStr;
        //     // endTime.current = row.endTimeStr;
        // }
        // // 将返回的时间转换为moment格式用于编辑显示在时间组件上
        // row.time = moment(row.time);
        // row.endTime = moment(row.endTime);
        // // 将表单数据设置为表格行数据
        // form.setFieldsValue(row); 
        // setDebtTitle('编辑债务记录');
        // setIsModalType('common');
        // setRowId(row.id);
        // operDialogFunc(true);
    }

    // 删除表格中的一行数据
    function handleDelete(row){
        // confirm弹框
        confirm({
            title: '注意，一旦删除该项目，其下所有的偿还记录也会被同时删除。请确认是否还要删除?',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消', 
            // confirm弹框内确认按钮事件
            onOk() {
                let par = {
                    id:row.id
                };
                deleteDebt(par).then((res)=>{
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

    // 设置搜索防抖功能
    const debounceDebtSearch = debounce(buttonSearch,1000);
    // 根据筛选条件搜索表格数据
    function buttonSearch(){
        // 每次翻页查询之后页码，条数重置
        if(tableRef.current){
            tableRef.current.resetPage()
        }
        setSearchData({
            status:status.current,
            keyword:keyword.current,
        })
    }

    return(
    <div>
        <header className='searchFormHeader'>
            <Form  className="debtWrap" layout="inline" name="Debt"  size="small"  >
                    <Form.Item  label="状态">
                        <Select  style={{ width: 190 }} onChange={statusChange} placeholder="请选择" allowClear >
                                {
                                    selectedStatusArray.map( (item) => (
                                    
                                        <Option key={item.value} value={item.value}>
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
                        <Button size="small" type="primary" className="searchBtn" onClick={debounceDebtSearch} > 搜索</Button>
                    </Form.Item>
            </Form>
        </header>
        <section>
              
                <Button size="small" type="primary" className="addConsumeBtn"  onClick={handleAdd} >添加新债务记录</Button>
                {/* <Button size="small" type="danger"  className="deleteConsumeBtn" onClick={handleDeleteRow} >删除 </Button> */}
                <span className='totalStyle'>总计 {totalAmount}￥ </span>

                <ArgTable 
                    ref={tableRef}
                    tableType={'debt'}            
                    owncolumns = {columns()}
                    queryAction={getDebtList}
                    params = {searchData} 
                    getRowKeys={handleDebtKeys}
                    initMethod={initFunc}
                    setTotalAmount = {setMount}
                />                           
               
                {/* 添加或编辑债务记录弹窗 */}
                {/* <AsyncModal title={debtTitle}  modalType={isModalType} vis={isModalVisible} isClosable={false} isFooter={debtFooter} operDialogFunc={operDialogFunc} handleOk={debounceDebtSubmit}>
                    <section >
                        <Form   name="debtForm"  form={form} initialValues={{'time':moment()}} labelCol={{span:6}}  size="middle"  autoComplete="off" >
                            <Form.Item style={{clear:'both'}} label="创建时间" name="time"  
                                    rules={[
                                        {required:true,message:'请选择创建时间'},
                                        
                                    ]}  >
                                    <DatePicker   format='YYYY-MM-DD' style={{ width: 100+'%' }} onChange={getTimeChange} placeholder="请选择创建时间" allowClear />
                            </Form.Item>
                            <Form.Item style={{clear:'both'}} label="结束时间" name="endTime"  
                                    rules={[
                                        {required:true,message:'请选择结束时间'},
                                        
                                    ]}  >
                                    <DatePicker   format='YYYY-MM-DD' style={{ width: 100+'%' }} onChange={getEndTimeChange} placeholder="请选择结束时间" allowClear />
                            </Form.Item>
                             <Form.Item label="详情" name="description"   
                                    rules={[
                                        {required:true,message:'请输入详情描述'},
                                        
                                    ]} >
                                <Input   allowClear   />
                            </Form.Item>
                            <Form.Item label="相关人" name="owner"   
                                    rules={[
                                        {required:true,message:'请输入相关人'},
                                        
                                    ]} >
                                <Input   allowClear   />
                            </Form.Item>
                             <Form.Item label="金额(借出为正)" name="amount"   
                                    rules={[
                                        {required:true,message:'请输入金额'},
                                        
                                    ]} >
                                <Input  type="number" allowClear   />
                            </Form.Item>
                             <Form.Item label="已还金额" name="repay"   
                                    rules={[
                                        {required:true,message:'请输入已偿还金额'},
                                        
                                    ]} >
                                <Input type="number"  allowClear   />
                            </Form.Item>
                            <Form.Item label="付款方式" name="paymentId"   
                                    rules={[
                                        {required:true,message:'请选择付款方式'},
                                        
                                    ]}> 
                                <Select  placeholder="请选择付款方式" allowClear>
                                        {
                                        paymentTypeArray.map( (item,index,arr) => (
                                        
                                            <Option key={item.id} value={item.id}>
                                                {item.name}
                                            </Option>
                                        ))
                                        }
                                </Select>
                            </Form.Item>
                            <Form.Item  label="状态" name="status">
                                <Select  placeholder="请选择" allowClear >
                                        {
                                            chooseStatusArray.map( (item) => (
                                            
                                                <Option key={item.value} value={item.value}>
                                                    {item.name}
                                                </Option>
                                            ))
                                        }
                                </Select>
                            </Form.Item>
                            <Form.Item label="补充描述" name="note" >
                                <TextArea row={1} placeholder="请输入补充描述，记录一段往事供将来回忆" />
                            </Form.Item>
                        </Form>
                    </section>
                </AsyncModal> */}
        </section>
    </div>
    )
}
export default Debt;