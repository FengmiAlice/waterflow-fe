import React, { useEffect, useState, useRef } from 'react';
import {useNavigate,useSearchParams} from 'react-router-dom';
import { DatePicker, Form, Button, Input, Select,Space,message,Modal } from 'antd';
import ArgTable from '../../../components/Table';
import moment from 'moment';
import { getDebtList, addDebt, getPaymentTypeList, deleteDebtRecord } from '../../../api/user';
import {debounce} from '../../../utils/appTools';
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

function DebtEdit() {
    // 偿还记录列表column
    const debtRecordColumns = () => {  
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
                    title: '偿还金额',
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
                                <Button size="small" type="primary"  onClick={ ()=> handleSingleDebtEdit(record)}>编辑</Button>
                                <Button size="small" type="danger"   onClick={ ()=> handleSingleDebtDelete(record)}>删除</Button>
                            </div>
                            <div className="miniBtnBox">
                                <Button size="small" type="text"  className='miniPrimaryBtn' onClick={ ()=> handleSingleDebtEdit(record)}>编辑</Button>
                                <Button size="small" type="text"  danger onClick={ ()=> handleSingleDebtDelete(record)}>删除</Button>
                            </div>
                        </Space>
                    )
                }    
            }
        ]
    }

    // 使用useForm创建新增债务记录form实例
    const [form] = Form.useForm();
    const recordTitle = () => '偿还记录列表';//设置偿还记录表格标题
    const debtRecordRef = useRef(null);//设置表格的ref
    const createTime = useRef('');//添加新债务记录创建时间初始值
    const endTime = useRef('');//添加新债务记录结束时间


    const chooseStatusArray = [
        { name: '全部', value: '' },
        { name: '偿还中', value: '偿还中' },
        { name: '已偿还', value: '已偿还' },
        { name: '呆账', value: '呆账' },
        { name: '坏账', value: '坏账' },
    ];
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();   
    const [paymentTypeArray, setPaymentTypeArray] = useState([]);//设置支付方式列表
    const [rowId, setRowId] = useState('');//设置债务记录行id
    const [recordDes,setRecordDes] = useState('');//设置所属债务
    const [recordKeys, setRecordRowKeys] = useState([])//设置偿还记录表格选择的数据

    //在页码或者页数变化的时候更新（在组件挂载和卸载时执行，传一个空数组，只执行一次）
    useEffect(() => {
        getPaymentList();
        let getRow = searchParams.get("debtRow");
        // console.log('获取searchParams传递的参数debtRow信息----', getRow)
        // 在组件挂载后，将查询参数赋值给表单数据
        if (getRow) {
            let data = JSON.parse(getRow);
            setRowId(data.id);
            setRecordDes(data.description);
            let startDate, endDate;
            // 解决日期组件出现NaN问题
            if (data.time === null || data.endTime === null) {
                startDate = moment();
                endDate = moment();
            } else {
                startDate = moment(data.time);
                endDate = moment(data.endTime);
            }
            form.setFieldsValue({
                'time': startDate,
                'endTime':endDate,
                'description':data.description,
                'owner':data.owner,
                'amount': data.amount,
                'repay': data.repay,
                'paymentId': data.paymentId,
                'status': data.status,
                'note': data.note,
            });

        }
    }, [form,searchParams])
    
    // 获取支出方式列表
    function getPaymentList(){
        getPaymentTypeList().then( (res) => {
            if(res.data.success === true){
                setPaymentTypeArray(res.data.page.list);
            }
        }).catch((error)=>{
            console.log(error)
        })
    }

    // 添加债务记录弹窗创建时间事件
    function getTimeChange(date, dateString) {
        // 非空判断
        dateString =dateString || '';
        createTime.current = dateString;
    }

    // 添加债务记录弹窗结束时间事件
    function getEndTimeChange(date, dateString) {
        // 非空判断
        dateString =dateString || '';
        endTime.current = dateString;
    }

    // 设置查询条件初始化
    function initFunc(){
        // console.log('父组件执行初始化')  
    }

    // 返回按钮事件
    const backGo = () => {
        navigate(-1);//返回上一个路由
    }

    // 设置偿还记录表格选择的数据
    function handleRecordKeys(val) {
        setRecordRowKeys(val)
    }

    // 添加偿还记录按钮事件
    function handleSingleDebt() {
        navigate(`/index/debt/debtRecordAdd?id=${rowId}&recordDes=${recordDes}`);
    }

    // 编辑单条偿还记录
    function handleSingleDebtEdit(row) {
        // console.log('偿还记录编辑', row);
        let rowParam = JSON.stringify(row);
        navigate(`/index/debt/debtRecordEdit?recordRow=${rowParam}&id=${rowId}&recordDes=${recordDes}`);
        // navigate('/index/debt/debtRecord',{state:{rowParam}} );
    }

    // 删除单条偿还记录
    function handleSingleDebtDelete(row) {
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
                deleteDebtRecord(par).then((res)=>{
                    if(res.data.success === true){
                        message.success(res.data.message);
                    }
                }).catch((error)=>{
                    console.log(error)
                })
            }
        });
    }

    // 使用防抖函数来限制表单提交的频率
    const debounceDebtSubmit = debounce(handleSubmit, 1000);
    // 添加&编辑债务记录弹窗信息确认操作
    async function handleSubmit() {
        try {
            const values = await form.validateFields();
            // console.log('编辑债务记录提交', values);
            if (values) {
                let params = {
                    id: rowId,
                    time: values.time.format('YYYY-MM-DD'),
                    endTime: values.endTime.format('YYYY-MM-DD'),
                    description: values.description,
                    owner:values.owner,
                    amount: values.amount,
                    repay: values.repay,
                    paymentId: values.paymentId,
                    status: values.status,
                    note: values.note
                };
                addDebt(params).then((res) => {
                    if (res.data.success === true) {
                        navigate(-1);//返回上一个路由
                    } 
                }).catch((error) => {
                    console.log(error)
                })    
            }
        } catch (error) {
            console.log('validate failed',error)
        }
    }

    return (
        <div className='debtSectionContainer'>
            <section className='recordFormBox'>
                <Form name="debtForm" form={form} labelCol={{ span: 4 }} size="middle" autoComplete="off" >
                    <Form.Item style={{ clear: 'both' }} label="创建时间" name="time"
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
                        <Input  allowClear   />
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
                        <Input  type="number"  allowClear   />
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
                        <Select  placeholder="请选择付款方式" allowClear >
                                {
                                paymentTypeArray.map( (item,index,arr) => (
                                
                                    <Option key={item.id} value={item.id}>
                                        {item.name}
                                    </Option>
                                ))
                                }
                        </Select>
                    </Form.Item>
                    <Form.Item  label="状态" name="status" >
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
                        <TextArea row={1}  placeholder="请输入补充描述，记录一段往事供将来回忆" />
                    </Form.Item>
                    <Form.Item className='debtSubmitBtnItem'>
                        <Button type="primary" onClick={debounceDebtSubmit}>提交</Button>
                        <Button className='backBtn' onClick={backGo}>返回</Button>
                    </Form.Item>
                </Form>
            </section> 
            <section className='recordTableBox'>
                <div className='recordBtn'>
                    <Button onClick={handleSingleDebt} type="primary"> 添加新偿还记录</Button>
                </div>
                <ArgTable 
                        ref={debtRecordRef}
                        title={recordTitle}
                        tableType={'debtRecord'}            
                        owncolumns = {debtRecordColumns()}
                        queryAction={getDebtList} 
                        getRowKeys={handleRecordKeys}
                        initMethod={initFunc} />
            </section>
        </div>
    )
}
export default DebtEdit;