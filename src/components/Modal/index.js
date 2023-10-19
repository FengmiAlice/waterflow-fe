import { useEffect, useState } from "react";
import { Modal} from 'antd';
/**
 *  @description：封装全局通用弹窗组件
 *  @param {string} title 弹窗标题 
 *  @param {boolean} vis 弹窗显示或隐藏属性
 *  @param {function} operDialogFunc 传递一个变量控制弹窗打开或关闭事件
 *  @param {string} modalType 区分弹窗类别
 *  @param {function} handleOperate 提交按钮事件处理函数
 *  @param {boolean} isClosable 是否显示右上角的关闭按钮
 *  @param {boolean} isFooter 是否显示底部按钮
 * 
*/
const useAsyncModal = (props)=>{
    const {title,modalType,vis,operDialogFunc,handleOk,isClosable,isFooter} = props;

    const [isVisble,setIsVisble] = useState(false);//设置弹窗显示或隐藏

    useEffect(()=>{
            // console.log(vis)
            // console.log(modalType)
            // 设置普通的弹窗显示隐藏
            if(modalType === 'common'){
                setIsVisble(vis)
            }
            // 设置添加类别其他特殊弹窗的显示隐藏
            if(modalType === 'special'){
                setIsVisble(vis)
            } 
    },[vis,modalType])

    return(
        <Modal title={title}  forceRender visible={isVisble} closable ={isClosable} onOk={handleOk} onCancel={()=> operDialogFunc(false)} okText="确认" cancelText="取消" footer={ isFooter ? undefined : null}>
            <div>{props.children}</div>
        </Modal>
    )
  
}
export default useAsyncModal;