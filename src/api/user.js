import http from '../utils/http';
/********************预算模块********************************/ 
// 获取预算列表
export function getBudgetList(params){
    return http('get','/api1/budget/list',params)
}
// 获取预算统计数据
export function getBudgetStatistic(params){
    return http('get','/api1/budget/statistic',params)
}
// 获取单条预算记录
export function getBudgetDetail(params){
    return http('get','/api1/budget/details',params)
}
// 新增编辑预算
export function addBudget(data){
    return http('post','/api1/budget/save',data)
}
// 删除预算
export function deleteBudget(data) {
    return http('post','/api1/budget/delete',data)
}
// 关闭预算
export function closeBudget(data) {
    return http('post','/api1/budget/close',data)
}

/********************支出模块*********************************/
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
// 支出页面统计分析
export function addConsumeAnalysis(data) {
    return http('post','/api1/report/statistics/pieChart/consumeSearchAmount',data)
}

/******************收入模块***********************************/
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

/**************账户模块**************************************/
// 账户页面获取账户统计信息
export function getStatistics(params){
    return http('get','/api1/account/statistic',params)
}
// 账户内的扇形图表统计
export function typePieAccount(params){
    return http('get','/api1/report/statistics/pieChart/typeAccount',params)
}
// 账户页面获取账户列表信息
export function getAccountList(params){
    return http('get','/api1/account/list',params)
}
// 删除账户
export function deleteAccountById(data){
    return http('post','/api1/account/delete',data)
}
// 新增账户
export function addAccount(data){
    return http('post','/api1/account/save',data)
}
// 转账
export function transformAccount(data){
    return http('post','/api1/account/transform',data)
}

/***********************债务模块*****************************/
// 获取债务列表
export function getDebtList(params) { 
    return http('get',"/api1/debt/list",params)
}
// 根据id获取债务单条数据
export function getDebtListById(params) {
    return http('get',"/api1/debt/list/getById",params)   
}
// 添加债务记录
export function addDebt(data) {
    return http('post',"/api1/debt/save/json",data)
}
// 删除债务记录
export function deleteDebt(data) {
    return http('post',"/api1/debt/delete",data)
}
// 获取偿还债务记录列表
export function getDebtRepayList(params) {
    return http('get',"/api1/debt/repay/list",params)
}
// 添加偿还债务记录
export function addDebtRecord(data) {
    return http('post',"/api1/debt/repay/save/json",data)
}
// 偿还债务记录删除
export function deleteDebtRecord(data) {
    return http('post',"/api1/debt/repay/delete",data)
}

/***********************理财模块*****************************/
// 获取理财统计数据
export function getInvestedStatistic(params) {
    return http('get', "/api1/invest/statistic", params)
}
// 获取理财列表数据
export function getInvestedList(params) {
    return http('get', "/api1/invest/list", params)
}
// 根据id获取理财单条数据
export function getInvestedListById(params) {
    return http('get', "/api1/invest/list/getById", params)
}
// 添加理财记录
export function addInvested(data) {
    return http('post', "/api1/invest/save/json", data)
}
// 删除理财记录
export function deleteInvested(data) {
    return http('post', "/api1/invest/delete", data)
}
// 获取买入卖出列表数据
export function getInvestedSingleList(params) {
    return http('get', "/api1/invest/single/list", params)
}
// 添加单条投资明细买入或卖出
export function addSingleInvest(data) {
    return http('post', "/api1/invest/single/save/json", data)
}
// 删除单条投资明细买入或卖出
export function deleteSingleInvest(data) {
    return http('post', "/api1/invest/single/delete", data)
}
// 添加分红记录
export function addDividend(data) {
    return http('post', "/api1/invest/addDivident", data)
}
// 更新收益
export function updateInvestCurrent(data) {
    return http('post', "/api1/invest/updateCurrent", data)
}
// 各类投资金额占比图数据
export function typePieInvestAmount(params) {
    return http('get', '/api1/report/statistics/pieChart/investAmount', params)
}
// 各类投入余额占比图数据
export function typePieInvestCurrent(params) {
    return http('get', '/api1/report/statistics/pieChart/investCurrent', params)
}
// 各类投资金额、累计收益等占比折线数据
export function typeLineInvestAmount(data) {
    return http('post', '/api1/report/statistics/multiData/invest', data)
}