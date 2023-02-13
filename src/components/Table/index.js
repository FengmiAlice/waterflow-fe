/**
 *  @description：封装全局通用table组件
 *  @param {Array} dataSource 表格数据源
 *  @param {number} total 表格总条数
 *  @param {number} current 当前页
 *  @param {number} pageSize 每页条数
 * 
 * 
*/

import React, { useEffect, useReducer, useCallback,useState,forwardRef, useImperativeHandle} from 'react'
import { Table } from 'antd';
// ref转发
const useAsyncTable = forwardRef( (props,ref) => {
    /*
    props的一些参数
    queryAction:获取列表数据api
    params:请求附加参数
    baseProps: antd基础props,
    owncolumns:表格列数据配置方法
    initMethod:初始化列表参数方法,
    getRowKeys:全选选中的数据方法
    getId:传递table ID方法
    setTotalAmount:统计表格总花费金额方法
    */
    const { owncolumns,queryAction,params, baseProps,initMethod,getRowKeys,setTotalAmount,tableType,} = props;
    const [initFlag,setInitFlag] = useState(false);//初始渲染标识
    const [selectedRowKeys,setSelectedRowKeys] = useState([]);//表格全选
    const [tableId,setTableId] = useState('');//设置表格动态id

    // 使用ref时，useImperativeHandle 暴露给父组件实例值和方法
    useImperativeHandle(ref, () => ({
        resetPage
    }))

    // 列表选择配置
    const rowSelection = {
        selectedRowKeys,
        onChange:onSelectChange
    }
    // 选择项选中后发生的变化
    function onSelectChange(selectedRowKeys){
        setSelectedRowKeys(selectedRowKeys)
        // 函数组件传值给父组件
        getRowKeys(selectedRowKeys)
    }

    // 分页数据
    const paginationInitial = {
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger:true,
        pageSizeOptions:['10','20','50','100'],
        showTotal:(total)=>{return `共${total}条数据`}, 
    }
   
    // table组件全量数据
    const initialState = {
        pagination: paginationInitial,
        dataSource: [],
    }
 
    // 使用redux useReducer管理 action操作如何修改state
     const reducer = (state, action) => {
        const { payload } = action
        switch (action.type) {
            case 'SET_PAGINATION':
                return { ...state, pagination: payload.pagination }
            case 'SET_DATA_SOURCE':
                return { ...state, dataSource: payload.dataSource }
            default:
                return state
        }
    }
    const [state, dispatch] = useReducer(reducer, initialState)

   
    // 改变页码事件
    function handleTableChange(payload) {
        if (payload) {
            const current  = payload.current;
            const pageSize = payload.pageSize;
            const total    = payload.total;

            dispatch({
                type: 'SET_PAGINATION',
                payload: {
                    pagination: {
                        ...state.pagination,
                        current,
                        pageSize,
                        total
                    }
                }
            })

            
        }
    }
    // 每次查询条件之后页数页码重置初始值
    const resetPage =()=>{
        state.pagination.current=1;
        state.pagination.pageSize = 10;
    }

    // useCallback缓存请求，减少不必要的渲染，优化组件性能
    const fetchDataWarp = useCallback(
        fetchData,
        [params, state.pagination.current,state.pagination.pageSize]
    )
    
    useEffect(() => {
        if(!initFlag ){
            // console.log("初始渲染111")
            initMethod();
            // 设置不同表格id名
            if(tableType === 'consume'){
                setTableId('consume_report')
            }
            if(tableType === 'income'){
                setTableId('income_report')
            }
            if(tableType === 'account'){
                setTableId('account_report')
            }


            // const tableIds = document.getElementById(tableId)
            // // 传递给父组件table id
            // getId(tableIds)
           
            setInitFlag(true)
        }else{
            // console.log('不是初始渲染1111')
        }
       
        fetchDataWarp()
       
    }, [fetchDataWarp])

    // 获取列表数据
    async function fetchData() {
        // 分页字段名称转换
        const { current: pageNum ,pageSize} = state.pagination;
        let res = await queryAction({ ...params, pageNum, pageSize  }).catch(err => {
          
            return {}
        })
      
        if (res.data.success === true) {
            const list = res.data.page.list;
            const  totalcounts = res.data.page.total;
            if(tableType === 'consume' || tableType === 'income'){
                setTotalAmount(res.data.extraData.totalAmount);
            }
           
            // 回填pagination里的参数数据
            dispatch({
                type: 'SET_PAGINATION',
                payload: {
                    pagination: { ...state.pagination, total: totalcounts }
                }
            })
            // 回填list数据
            dispatch({
                type: 'SET_DATA_SOURCE',
                payload: {
                    dataSource: list
                }
            })

        }
    }

    return (
        <Table
            id={tableId}
            rowSelection={rowSelection}
            columns={owncolumns}
            pagination={state.pagination}
            dataSource={state.dataSource}
            onChange={handleTableChange}
            {...baseProps}
        />
    )
})

export default useAsyncTable;