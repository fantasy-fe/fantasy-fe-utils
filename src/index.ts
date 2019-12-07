export const getUrlParam = name => { // 给定URL参数名称取得对应的参数
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  if (reg.test(location.search.substr(1))) {
    return decodeURIComponent(RegExp.$2);
  } else if (reg.test(location.hash.substr(location.hash.indexOf('?') + 1))) {
    return decodeURIComponent(RegExp.$2);
  } else {
    return '';
  }
};