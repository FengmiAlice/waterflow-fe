
import  http  from '../utils/http';

// 报告页面获取支出收入余额信息数据
export function getOverview(params){
    return http('get','/proxy/report/overview/content',params)
}