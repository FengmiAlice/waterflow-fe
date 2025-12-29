import React, { useEffect, useState, useRef } from 'react';
import {useNavigate} from 'react-router-dom';
import { DatePicker,Form,Button,Input,Select} from 'antd';
import dayjs from 'dayjs';
import { addDebt, getPaymentTypeList } from '../../../api/user';
import {debounce} from '../../../utils/appTools';
const { Option } = Select;
const {TextArea} = Input;
function DebtAdd() {
      // 使用useForm创建新增支出记录form实例
    const [form] = Form.useForm();
   
    let currentTime= dayjs().format("YYYY-MM-DD");
    const createTime = useRef(currentTime);//添加新债务记录创建时间初始值
    const endTime = useRef('');//添加新债务记录结束时间
    const chooseStatusArray = [
        { name: '全部', value: '' },
        { name: '偿还中', value: '偿还中' },
        { name: '已偿还', value: '已偿还' },
        { name: '呆账', value: '呆账' },
        { name: '坏账', value: '坏账' },
    ];
    const navigate = useNavigate();
    const [paymentTypeArray, setPaymentTypeArray] = useState([]);//设置支付方式列表
    
    //在页码或者页数变化的时候更新（在组件挂载和卸载时执行，传一个空数组，只执行一次）
    useEffect(()=>{
            getPaymentList();
    }, [])
    
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

    // 返回按钮事件
    const backGo = () => {
        navigate(-1);//返回上一个路由
    }

    // 使用防抖函数来限制表单提交的频率
    const debounceDebtSubmit = debounce(handleSubmit, 1000);
    // 添加债务记录弹窗信息确认操作
    async function handleSubmit() {
        try {
            const values = await form.validateFields();
            // console.log('债务记录提交', values)
            if (values) {
                 let endT = values.endTime;
                if (endT) {
                    endT=endT.format('YYYY-MM-DD');
                } else {
                    endT = '';
                }
                let params = {
                    id: '',
                    time: values.time.format('YYYY-MM-DD'),
                    endTime: endT,
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
                <Form   name="debtForm"  form={form} initialValues={{'time':dayjs()}} labelCol={{span:4}}  size="middle"  autoComplete="off" >
                    <Form.Item style={{clear:'both'}} label="创建时间" name="time"  
                            rules={[
                                {required:true,message:'请选择创建时间'},
                                
                            ]}  >
                            <DatePicker   format='YYYY-MM-DD' style={{ width: 100+'%' }} onChange={getTimeChange} placeholder="请选择创建时间" allowClear />
                    </Form.Item>
                    <Form.Item style={{clear:'both'}} label="结束时间" name="endTime"  
                              >
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
                            >
                        <Input type="number"  allowClear   />
                    </Form.Item>
                    <Form.Item label="支付方式" name="paymentId"   
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
                    <Form.Item  label="债务状态" name="status">
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
                    <Form.Item className='debtSubmitBtnItem'>
                        <Button type="primary" onClick={debounceDebtSubmit}>提交</Button>
                        <Button className='backBtn' onClick={backGo}>返回</Button>
                    </Form.Item>
                </Form>
            </section>
        </div>
    )
    
}
export default DebtAdd;