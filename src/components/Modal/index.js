import { useEffect, useState } from "react";
import { Modal} from 'antd';
import {ExclamationCircleOutlined} from '@ant-design/icons';
const {confirm} = Modal;
/**
 *  @description：封装全局通用弹窗组件
 *  @param {string} title 弹窗标题 
 *  @param {boolean} vis 弹窗显示或隐藏
 *  @param {function} operDialogFunc 打开或关闭弹窗事件
 *  @param {} formData 传递过来的表格数据
 *  @param {} queryAction 请求api
 *  @param {}  params:请求附加参数
 * 
 * 
 * 
*/
const useAsyncModal = (props)=>{
    const {title,vis,operDialogFunc,handleOperate} = props;
    const [isVisible,setIsVisible] = useState(false);
    function handleSubmit(){
        confirm({
            title: '确认提交?',
            icon: <ExclamationCircleOutlined />,
            okText:"确认",
            cancelText:"取消",
            // 确认按钮操作
            onOk() {
                handleOperate()
            },
        });
    }
    useEffect(()=>{
        console.log(vis)
        setIsVisible(vis)
    },[vis])

    return(
        <Modal title={title} forceRender visible={isVisible} onOk={handleSubmit} onCancel={()=>operDialogFunc(false)} okText="确认" cancelText="取消" >
            <div>{props.children}</div>
        </Modal>
    )
  
}
export default useAsyncModal;