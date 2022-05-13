/**
 *  @description：封装全局通用table组件
 *  @param {Array} dataSource 表格数据源
 *  @param {number} total 表格总条数
 *  @param {number} current 当前页
 *  @param {number} pageSize 每页条数
 * 
 * 
*/

import React, { useEffect, useReducer, useCallback,useState } from 'react'
import { Table } from 'antd';
 
const useAsyncTable = props => {

    /*
    要传递的参数
    queryAction:获取列表数据api
    params:请求附加参数
    baseProps: antd基础props,
    owncolumns:表格列数据配置
    initMethod:初始化
    */
    const {owncolumns,queryAction, params, baseProps,initMethod } = props;

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
        dataSource: []
    }
    // 使用redux useReduxer管理 action操作如何修改state
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
    const [initFlag,setInitFlag] = useState(false);//初始渲染标识
    // 改变页码事件
    function handleTableChange(payload) {
        if (payload) {
            const current  = payload.current;
            const pageSize = payload.pageSize;
            const total = payload.total;
    
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
    // useCallback包装请求，缓存依赖，优化组件性能
    const fetchDataWarp = useCallback(
        fetchData,
        [params, state.pagination.current,state.pagination.pageSize]
    )
    
    useEffect(() => {
        if(!initFlag ){
            // console.log("初始渲染111")
            initMethod()
           
            setInitFlag(true)
        }else{
            // console.log('不是初始渲染1111')
            
        
        }
        fetchDataWarp()
       
    }, [fetchDataWarp])

    // 获取列表数据
    async function fetchData() {
        console.log(111)
        // 分页字段名称转换
        const { current: pageNum ,pageSize} = state.pagination
        console.log(params)
        let res = await queryAction({ ...params, pageNum, pageSize  }).catch(err => {
          
            return {}
        })
      
        if (res.data.success === true) {
            const list = res.data.page.list;
            const  totalcounts = res.data.page.total;
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
            columns={owncolumns}
            pagination={state.pagination}
            dataSource={state.dataSource}
            onChange={handleTableChange}
            {...baseProps}
        />
    )
}
export default useAsyncTable;