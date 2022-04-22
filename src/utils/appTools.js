/**
 * @description: 根据url解析出路由path路径
 * @param {string} url 默认取当前页面地址
 * @param {boolean} isIncludeParams 是否需要包含路由参数，便于路由跳转携带数据
 * @return {string}
 */
 function getRoutePath (url = '', isIncludeParams = false) {
    url = url || window.location.href
    const divideStr = process.env.PUBLIC_URL + '/'
    const reg = new RegExp(`//[\\w-\\.:]+${divideStr}(.*)*`)
    const match = url.match(reg) || []
    const pathWithParams = '/' + (match[1] || '')
    if (!isIncludeParams) {
      return pathWithParams
    } else {
      const path = pathWithParams.split('?')[0]
      return path
    }
  }
  export {
    getRoutePath
  }