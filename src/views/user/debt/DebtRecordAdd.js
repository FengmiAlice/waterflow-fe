import React, {useEffect, useState, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { DatePicker, Form, Button, Input, Select,message } from 'antd';
import { getPaymentTypeList, addDebtRecord } from '../../../api/user';
import { debounce } from '../../../utils/appTools';
import dayjs from 'dayjs';
const { Option } = Select;
const { TextArea } = Input;

export default function DebtRecordAdd() {

  // 使用useForm创建新增债务记录form实例
    const [debtAddRecordForm] = Form.useForm();
    const navigate = useNavigate(); 
    let currentTime= dayjs().format("YYYY-MM-DD");
    const debtRecordTime = useRef(currentTime);//设置偿还债务记录默认时间
    const [debtId, setDebtId] = useState('');//设置债务记录行id
    const [paymentTypeArray, setPaymentTypeArray] = useState([]);//设置支付方式列表
    const [initFlag,setInitFlag] = useState(false);//设置初始化标识
    useEffect(() => {
        getPaymentList();
        if(!initFlag){
            setInitFlag(true);
            // console.log('初始渲染111')
            let searchParams = new URLSearchParams(window.location.search);
            if (searchParams) {
                let id = searchParams.get('id');
                let des = searchParams.get('recordDes');
                setDebtId(id);//设置债务id
                debtAddRecordForm.setFieldsValue({ 'debtName':des });//给所属债务项赋值
            }
        } else {
            // console.log('不是初始渲染222')
        }
    },[debtAddRecordForm,initFlag])
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
            // 添加偿还记录弹窗信息确认操作
    const debounceDebtRecordSubmit = debounce(handleRecordSubmit, 1000);
    async function handleRecordSubmit() {
        try {
            const values = await debtAddRecordForm.validateFields();
            // console.log('新增偿还记录---',values)
            if (values) {
                let params = {
                    id: '',//偿还记录表的id
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
                <Form   name="debtAddRecordForm"  form={debtAddRecordForm} initialValues={{'time':dayjs()}} labelCol={{span:4}}  size="middle"  autoComplete="off" >
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