import React, {useEffect, useState, useRef} from 'react';
import { useNavigate } from 'react-router-dom';//useLocation、useSearchParams
import { DatePicker, Form, Button, Input, Select,message } from 'antd';
import { getPaymentTypeList, addDebtRecord } from '../../../api/user';
import { debounce } from '../../../utils/appTools';
import dayjs from 'dayjs';
const { Option } = Select;
const { TextArea } = Input;


function DebtRecordEdit() {

    // 使用useForm创建新增债务记录form实例
    const [debtEditRecordForm] = Form.useForm();
    // let location = useLocation();//获取navaigate中传递的state信息
    // console.log('navaigate中传递的params', location);
    const navigate = useNavigate();
    let currentTime= dayjs().format("YYYY-MM-DD");
    const debtRecordTime = useRef(currentTime);//设置偿还债务记录默认时间
    const [debtId, setDebtId] = useState('');//设置债务记录行id
    const [recordId, setRecordId] = useState('');//设置偿还记录的行id
    const [paymentTypeArray, setPaymentTypeArray] = useState([]);//设置支付方式列表
    useEffect(() => {
        getPaymentList();
        // 给偿还记录所属债务表单项赋值
         // 获取查询参数
        const searchParams = new URLSearchParams(window.location.search);//获取url参数
        let id = searchParams.get('id');
        let des = searchParams.get('recordDes');
        // console.log('债务id---', id);
        setDebtId(id);//设置债务id
        debtEditRecordForm.setFieldsValue({ 'debtName': des });//给所属债务项赋值
        
        const queryData = {};
        // 遍历查询参数，并将其赋值给表单数据
        for (const [key, value] of searchParams.entries()) {
            queryData[key] = value;
        }
        // console.log('1111----', queryData)
        if (queryData) {
            let data = JSON.parse(queryData.recordRow);
            setRecordId(data.id);
             let startDate;
            // 解决日期组件出现NaN问题
            if (data.time === null) {
                startDate = dayjs();
            } else {
                startDate = dayjs(data.time);
            }
            // console.log('2222----', data)
            //在组件挂载后，将查询参数赋值给表单数据
            debtEditRecordForm.setFieldsValue({
                'time': startDate,
                'description':data.description,
                'amount': data.amount,
                'paymentId': data.paymentId,
                'note': data.note,
            });
        }
    }, [debtEditRecordForm])
    
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

    // 偿还记录时间选择事件
    function getSingleTimeChange(date, dateString){
        // 非空判断
        dateString = dateString || '';
        debtRecordTime.current = dateString;
    }

    // 返回按钮事件
    const backGo = () => {
        navigate(-1);//返回上一个路由
    }

    // 编辑偿还记录弹窗信息确认操作
    const debounceDebtRecordSubmit = debounce(handleRecordSubmit, 1000);
    async function handleRecordSubmit() {
        try {
            const values = await debtEditRecordForm.validateFields();
            // console.log('编辑偿还记录---',values)
            if (values) {
                let params = {
                    id: recordId,//偿还记录表的id
                    debtId:debtId,//编辑的债务id
                    time: values.time.format('YYYY-MM-DD'),
                    debtName:values.debtName,
                    description: values.description,
                    amount: values.amount,
                    paymentId: values.paymentId,
                    note: values.note
                };
                addDebtRecord(params).then((res) => {
                    if (res.data.success === true) {
                        message.success(res.data.message);
                        navigate(-1);
                    } 
                }).catch((error) => {
                    console.log(error)
                })
            }
        } catch (error) {
            console.log('validate failed', error)
        }
    }

    return (
        <div className='debtSectionContainer'>
            <section className='recordFormBox'>
                <Form   name="debtEditRecordForm"  form={debtEditRecordForm} initialValues={{'time':dayjs()}} labelCol={{span:4}}  size="middle"  autoComplete="off" >
                    <Form.Item style={{clear:'both'}} label="时间" name="time"  
                            rules={[
                                {required:true,message:'请选择时间'},
                                
                            ]}  >
                            <DatePicker   format='YYYY-MM-DD' style={{ width: 100+'%' }} onChange={getSingleTimeChange} placeholder="请选择创建时间" allowClear />
                    </Form.Item>
                    <Form.Item style={{clear:'both'}} label="所属债务" name="debtName"  >
                            <Input disabled />
                    </Form.Item>
                        <Form.Item label="详情" name="description"   
                            rules={[
                                {required:true,message:'请输入详情描述'},
                                
                            ]} >
                        <Input   allowClear   />
                    </Form.Item>
                    <Form.Item label="偿还金额(收债为正)" name="amount"   
                            rules={[
                                {required:true,message:'请输入'},
                                
                            ]} >
                        <Input  type="number" allowClear   />
                    </Form.Item>
                    <Form.Item label="支付方式" name="paymentId"   
                            rules={[
                                {required:true,message:'请选择支付方式'},
                                
                            ]}> 
                        <Select  placeholder="请选择" allowClear>
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
                    <Form.Item className='debtSubmitBtnItem'>
                        <Button  type="primary" onClick={debounceDebtRecordSubmit}>提交</Button>
                        <Button  className='backBtn' onClick={backGo}>返回</Button>
                    </Form.Item>
                </Form>
            </section>
        </div>
    )
 }
export default DebtRecordEdit;
