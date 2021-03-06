import  http  from '../utils/http';

// 支出页面获取支出列表信息
export function getConsumeList(params){
    return http('get','/api1/consume/list',params)
}
// 支出页面获取支出类别列表信息
export function getConsumeTypeList(params){
    return http('get','/api1/type/list',params)
}
//获取付款方式列表信息
export function getPaymentTypeList(){
    return http('get','/api1/payment/list')
}
// 支出页面添加表格一行数据
export function addTableRow(data){
    return http('post','/api1/consume/saveConsumeDetails',data)
}
// 支出页面获取表格一行数据用于编辑
export function getTableRowDetail(params){
    return http('get','/api1/consume/details',params)
}
// 支出页面删除表格一行数据
export function deleteTableRow(data){
    return http('post','/api1/consume/delete',data)
}
// 支出页面批量删除
export function deleteTableRowArray(data){
    return http('post','/api1/consume/batch/delete',data)
}
// 支出页面批量导出
export function exportConsumeTable(pars,data){
    return http('post','/api1/doc/export/consume?userId='+pars,data)
}
// 支出页面新增和编辑添加新类别
export function addType(data){
    return http('post','/api1/type/add',data)
}

// 收入页面获取收入列表信息
export function getIncomeList(params){
    return http('get','/api1/income/list',params)
}
// 收入页面批量导出
export function exportIncomeTable(pars,data){
    return http('post','/api1/doc/export/income?userId='+pars,data)
}
// 收入页面添加表格数据
export function addIncomeTableRow(data){
    return http('post','/api1/income/saveIncomeDetails',data)
}
// 收入页面删除表格数据
export function deleteIncomeTableRow(data){
    return http('post','/api1/income/delete',data)
}
// 收入页面新增和编辑添加新类别
export function addIncomeType(data){
    return http('post','/api1/type/add',data)
}