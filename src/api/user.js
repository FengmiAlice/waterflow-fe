import  http  from '../utils/http';

// 获取支出列表信息
export function getConsumeList(params){
    return http('get','/proxy/consume/list',params)
}
// 获取支出类别列表信息
export function getConsumeTypeList(params){
    return http('get','/proxy/type/list',params)
}
// 获取支付方式列表信息
export function getPaymentTypeList(){
    return http('get','/proxy/payment/list')
}

export function addTableRow(data){
    return http('post','/proxy/consume/saveConsumeDetails',data)
}
// 删除表格一行数据
export function deleteTableRow(data){
    return http('post','/proxy/consume/delete',data)
}