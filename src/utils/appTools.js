
/**
 * 通用工具函数
*/
import { routes } from '../router';
/**
 * 获取路由路径和路由meta字段的映射数据
 * 数据结构：{
 * '/index':'首页'
 * }
 * 
 */
function getRouteMetaMap() {
  const map = new Map();
  /**
   * 递归处理路由，将标题存入Map
   */
  const processRoute = (route, parentPath = '') => {
    // 过滤不需要的路由
    if (route.redirect || route.path === '*' || !route.path || route.meta?.hideMenu) {
      return;
    }
    // 构建完整路径
    let fullPath = route.path;
    if (parentPath && !route.path.startsWith('/')) {
      // 处理相对路径
      if (parentPath.endsWith('/')) {
        fullPath = `${parentPath}${route.path}`;
      } else {
        fullPath = `${parentPath}/${route.path}`;
      }
    }
    // 规范化路径（移除重复的斜杠）
    fullPath = fullPath.replace(/\/+/g, '/');
    // 如果有标题，存入Map
    if (route.meta?.title) {
      map.set(fullPath, route.meta.title);
    }
    // 处理子路由
    if (route.children && route.children.length > 0) {
      route.children.forEach(child => {
        processRoute(child, fullPath);
      });
    }
  };
  // 处理所有路由
  routes.forEach(route => {
    processRoute(route);
  });
  
  return map;
}
// function getRouteMetaMap() {
//     const getMap = (routeList = []) => {
//         let map = new Map();
//         routeList.forEach((v)=>{
//             putTitleinMap(v,map)
//         })
//         return map;
//     }
//     return getMap(routes);
// }

/**
 * 把obj.title和obj.children.title放入map里
 * 
 * return void
 */
// function putTitleinMap(obj,map){
//     obj.meta = obj.meta || {};
 
//     if(obj.redirect || obj.path === '*' || obj.path === undefined || obj.meta.hideMenu === true){
//         return;
//     }
//     map.set(obj.path, obj.meta.title)
//     if(obj.children&&obj.children.length>0){
//         obj.children.forEach((k) => {
//             // map.set(k.path,k.meta.title)
//             putTitleinMap(k,map)
//         })
//     }
// }

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
  /**
 * @description: 获取地址参数
 * @param {string} url 指定地址，默认取当前页地址
 * @return {string} { a: 1, b: 2, c: 3 }
 */
function getQueryObject(url) {
    // 更安全的 URL 获取方式
    url = url || (typeof window !== 'undefined' ? window.location.href : '');
    // 使用 URL API（现代浏览器推荐）
    try {
        const urlObj = new URL(url);
        const params = {};
        
        urlObj.searchParams.forEach((value, key) => {
        params[key] = decodeURIComponent(value);
        });
        
        return params;
    } catch (e) {
        // 回退到原来的正则方法
        return parseQueryString(url);
    }
}
// 备用方法
function parseQueryString(url) {
  const questionIndex = url.lastIndexOf('?');
  const params = {};
  if (questionIndex > 0) {
    const search = url.substring(questionIndex + 1);
    const reg = /([^?&=]+)=([^?&=]*)/g;
    search.replace(reg, (match, key, value) => {
      const name = decodeURIComponent(key);
      const val = decodeURIComponent(value);
      params[name] = val;
      return match;
    });
  }
  return params;
}

/**
 * @description: 函数防抖
 * @param {function} fn 函数
 * @param {number} t 等待时间（毫秒）
 * @return {function}
 */

 function debounce(fn, t) {
  var timeId;
  var delay = t || 500;
  return function () {
      var _this = this;
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
      }
      if (timeId) {
          clearTimeout(timeId);
      }
      timeId = setTimeout(function () {
          timeId = null;
          fn.apply(_this, args);
      }, delay);
  };
}
/**
* @description: 函数节流
* @param {function} fn 函数
* @param {number} t 间隔时间（毫秒）
* @return {function}
*/

function throttle(fn, t) {
  var timeId;
  var firstTime = true;
  var interval = t || 500;
  return function () {
      var _this = this;
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
      }
      if (firstTime) {
          fn.apply(this, args);
          firstTime = false;
          return;
      }
      if (timeId) {
          return;
      }
      timeId = setTimeout(function () {
          clearTimeout(timeId);
          timeId = null;
          fn.apply(_this, args);
      }, interval);
  };
}
/**
 * @description: 获取数据类型
 * @param {any} data 数据
 * @return {string} 'array'
 */
 function getDataType(data) {
  var str = Object.prototype.toString.call(data);
  return str.match(/\s(\w*)\]/)[1].toLowerCase();
}
/**
 * @description: 日期时间格式化
 * @param {Date | number | string} time js的date类型、时间戳、格式化后的日期格式
 * @param {string} format 自定义时间格式，选填，默认为'{y}-{m}-{d} {h}:{i}:{s}'，星期为{a}
 * @param {boolean} isNeedZero 是否需要自动补零，默认true
 * @return {string} 默认格式 2018-09-01 10:55:00
 */

 function formatDate(time, format, isNeedZero) {
  if (format === void 0) { format = '{y}-{m}-{d} {h}:{i}:{s}'; }
  if (isNeedZero === void 0) { isNeedZero = true; }
  time = time || new Date();
  // eslint-disable-next-line eqeqeq
  if (+time == time) {
      time = +time;
  }
  var date;
  if (typeof time === 'string') {
      time = time.replace(/-/g, '/');
      date = new Date(time);
  }
  else if (typeof time === 'number') {
      if (('' + Math.floor(time)).length === 10)
          time = time * 1000;
      date = new Date(time);
  }
  else {
      date = time;
  }
  var formatObj = {
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      i: date.getMinutes(),
      s: date.getSeconds(),
      a: date.getDay(),
  };
  var timeStr = format.replace(/{(y|m|d|h|i|s|a)+}/g, function (result, key) {
      var value = formatObj[key];
      if (key === 'a')
          return ['一', '二', '三', '四', '五', '六', '日'][value - 1];
      if (isNeedZero) {
          if (result.length > 0 && value < 10) {
              value = '0' + value;
          }
      }
      return value || 0;
  });
  return timeStr;
}
/**
* @description: 日期格式转时间戳
* @param {Date | string} date js的date类型、格式化后的日期格式 2019-05-24 14:22:17
* @return {number} 1558678937000
*/
function getTimestamp(date) {
  if (!date) {
      return +new Date();
  }
  if (typeof date === 'string') {
      date = date.replace(/-/g, '/');
  }
  return +new Date(date);
}
// 记住密码设置cookie
function setCookie(name,value,expiryDate){
    let currentDate=new Date();
    currentDate.setDate(currentDate.getDate()+expiryDate);
    document.cookie = name+'='+value+';expires='+currentDate;
}
// 获取cookie
function getCookie(name){
    let arr=document.cookie.split(';')
    for(let i=0;i<arr.length;i++){
        let arr2=arr[i].split('=');
        if(arr2[0].trim() === name){
            return arr2[1]
        }
    }
    return '';
}
// 移除cookie
function removeCookie(name){
    setCookie(name,1,-1)
}
// 获取url?后面的参数
function getQueryParams() {
    var url = decodeURI(window.location.search); //获取地址栏url"?"符后的字符串
    const result = {};
    if (url.indexOf("?") !== -1) {
        var str = url.substring(1);
        var urlCode = str.split('&');
        for (let i = 0; i < urlCode.length; i++) {
            result[urlCode[i].split('=')[0]] = decodeURIComponent(urlCode[i].split('=')[1]);
        }
    }
   
    return result;
}

export {
  getRouteMetaMap,
  getRoutePath,
  getQueryObject,
  getDataType,
  formatDate,
  getTimestamp,
  debounce,
  throttle,
  setCookie,
  getCookie,
  removeCookie,
  getQueryParams
}
