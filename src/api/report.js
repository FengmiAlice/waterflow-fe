
import  http  from '../utils/http';

// 报告页面获取支出收入余额信息数据
export function getOverview(params){
    return http('get','/proxy/report/overview/content',params)
}
// 获取报告页面各类开支占比图数据
export function getConsumePie(params){
    return http('get','/proxy/report/statistics/pieChart/consumeTypeAmount',params)
}

// 获取报告页面各类支付方式占比图数据
export function getConsumePieType(params){
    return http('get','/proxy/report/statistics/pieChart/consumePaymentAmount',params)
}
// 获取报告页面各类收入占比图数据
export function getIncome(params){
    return http('get','/proxy/report/statistics/pieChart/incomeTypeAmount',params)
}
// 获取报告页面最近半年收支情况柱状图数据

export function getConsumeIncomeLately(){
    return http('get','/proxy/report/statistics/typeBar/consumeIncomeLately')
}