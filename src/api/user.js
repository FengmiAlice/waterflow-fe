import  http  from '../utils/http';
// 获取支出列表信息
export function getConsumeList(params){
    return http('get','/proxy/consume/list',params)
}