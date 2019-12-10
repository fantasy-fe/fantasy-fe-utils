/**
* 邮箱，邮编，手机号等常用验证模块
*/
define('jsBasePath/common/commonvalidate', function (require, exports, module) {
  var commonValidate = {};
  /**
   * 手机号验证
   * @param val
   * @returns
   */
  commonValidate.isMobile = function (val) {
    var myreg = /^(13[0-9]|15[^4,\D]|16[6]|17[0-9]|18[0-9]|14[56789]|19[89])[0-9]{8}$/;
    return (myreg.test(val));
  };
  /**
   * 有区域前缀的手机号验证
   * @param val
   * @returns
   */
  commonValidate.isMobileNew = function (val) {
    var myreg = /^((\(\d{3}\))|(\d{3}\-))?(13[0-9]|15[^4,\D]|16[6]|17[0-9]|18[0-9]|14[56789]|19[89])[0-9]{8}$/;
    return (myreg.test(val));
  };
  /**
   * 验证固定电话是否可用
   * */
  commonValidate.isTelephone = function (val) {
    var reg = /^((0\d{2,3})-?)(\d{7,8})(-?(\d{1,5}))?$/;
    return reg.test(val);
  };
  /**
   * 固定电话验证
   * @param val
   * @returns
   */
  commonValidate.isTelNew = function (val) {
    var myreg = /^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/;
    return (myreg.test(val));
  };

  /**
   * 验证电话（开放数字、减号、分号、逗号，多个电话）
   */
  commonValidate.checkTelphone = function (val) {
    var telreg = /^[0-9]+[0-9|;|,|\-]*$/;
    return (telreg.test(val));
  };
  /**
   * 邮箱验证
   * @param val
   * @returns {Boolean}
   */
  commonValidate.isEmail = function (val) {
    var pass = 0;
    if (window.RegExp) {
      var tempS = "a";
      var tempReg = new RegExp(tempS);
      if (tempReg.test(tempS)) {
        pass = 1;
      }
    }
    if (!pass) {
      return (val.indexOf(".") > 2) && (val.indexOf("@") > 0);
    }
    var r1 = new RegExp("(@.*@)|(\\.\\.)|(@\\.)|(^\\.)");
    var r2 = new RegExp(
      "^[a-zA-Z0-9\\.\\!\\#\\$\\%\\&\\??\\*\\+\\-\\/\\=\\?\\^\\_\\`\\{\\}\\~]*[a-zA-Z0-9\\!" +
      "\\#\\$\\%\\&\\??\\*\\+\\-\\/\\=\\?\\^\\_\\`\\{\\}\\~]\\@(\\[?)[a-zA-Z0-9\\-\\.]" +
      "+\\.([a-zA-Z]{2,3})(\\]?)$");
    return (!r1.test(val) && r2.test(val));
  };
  /**
   * 邮政编码验证
   * @param val
   * @returns
   */
  commonValidate.isPostcode = function (val) {
    var myreg = /^[0-9]\d{5}$/;
    return (myreg.test(val));
  };

  /**
   * 是否有包含汉字
   * @param val
   * @returns true包含；false不包含
   */
  commonValidate.isContainZH = function (val) {
    var myreg = /[^\x00-\xff]/g;
    return (myreg.test(val));
  };

  /**
   * 验证是否有非法字符
   * @param str
   * @returns "":验证通过；其他：验证失败
   *
   */
  commonValidate.checkStr = function (str) {
    if (!str) {
      return "不能为空！";
    }
    var checkString = "`~!@#$%^&*()+-=[]{}\\|;':\",./<>?";
    for (var j = 0; j < checkString.length; j++) {
      if (str && str.indexOf(checkString.substring(j, j + 1)) != -1) {
        //  return "不能有非法字符:\"" + checkString.substring(j, j + 1) + "\"";
        return checkString.substring(j, j + 1);
      }
    }
    return "";
  };

  /**
   * 验证是否有非法字符
   * @param str
   * @returns
   */
  commonValidate.checkStrA = function (str, checkString) {
    if (!str) {
      return "不能为空！";
    }
    if (!checkString) {
      checkString = "`~!@#$%^&*+=\\|'\",./<>?";
    }
    for (var j = 0; j < checkString.length; j++) {
      if (str && str.indexOf(checkString.substring(j, j + 1)) != -1) {
        //  return "不能有非法字符:\"" + checkString.substring(j, j + 1) + "\"";
        return checkString.substring(j, j + 1);
      }
    }
    return "";
  };

  /**
   * 验证waf特殊字符
   * @param str
   * @returns "":验证通过；其他：验证失败
   *
   */
  commonValidate.checkWafStr = function (str) {

    var returnVal = null;
    if (str) {
      var checkString = "\'\\";
      for (var j = 0; j < checkString.length; j++) {
        if (str.indexOf(checkString.substring(j, j + 1)) != -1) {
          return checkString.substring(j, j + 1);
        }
      }

      if (str.indexOf("--") != -1) {
        returnVal = '--';
      }
    }

    return returnVal;
  };

  /**
   * 判断字符串是否包含空格
   * @param str
   */
  commonValidate.isContainBlank = function (str) {
    var returnVal = "";
    var reg = /\s/;
    if (reg.exec(str)) {
      returnVal = '包含空格';
    }
    return returnVal;
  };

  //RegExt Test
  function regExpTest(source, re) {
    var result = false;

    if (!source)
      return false;

    if (source == re.exec(source))
      result = true;

    return result;
  }

  /**
   * 对输入域是否是整数的校验,即只包含字符0123456789
   * @param strValue
   * @returns
   */
  commonValidate.isInteger = function (strValue) {
    return regExpTest(strValue, /\d+/);
  };

  //数字检查
  commonValidate.isNumeric1 = function (strValue) {
    var result = regExpTest(strValue, /\d*[.]?\d*/g);
    return result;
  };

  /**
   * 只输入数字和字母的正则
   * @param str
   * @returns
   */
  commonValidate.checkRentName = function (str) {
    var re = /^[0-9a-zA-Z]{1,16}$/;
    return re.test(str);
  };

  /**
   * 只输入4位字母的正则
   * @param str
   * @returns
   */
  commonValidate.OnlyEn = function (str) {
    var re = /^[a-zA-Z]{4}$/;
    return re.test(str);
  };
  /**
   * 字符串里是否包含空格
   * @param str
   * @returns true:包含；false:不包含
   */
  commonValidate.containBlank = function (str) {
    var flag = false;
    if (str) {
      for (var j = 0; j < str.length; j++) {
        if (str.substring(j, j + 1) == " ") {
          flag = true;
          break;
        }
      }
    }

    return flag;
  };

  /**
   * 是否是图片格式
   * @param str
   * @returns true:是；false:否
   */
  commonValidate.isImage = function (str) {
    var reg = /^.+\.(gif|jpg|bmp|png)$/i;
    return reg.test(str);
  };

  /**
   * 输入的数据是否是日期
   * @param intYear
   * @param intMonth
   * @param intDay
   * @returns {Boolean}
   */
  commonValidate.isdate = function (intYear, intMonth, intDay) {
    if (isNaN(intYear) || isNaN(intMonth) || isNaN(intDay)) {
      return false;
    }
    if (intMonth > 12 || intMonth < 1) {
      return false;
    }
    if (intDay < 1 || intDay > 31) {
      return false;
    }
    if ((intMonth == 4 || intMonth == 6 || intMonth == 9 || intMonth == 11) && (intDay > 30)) {
      return false;
    }
    if (intMonth == 2) {
      if (intDay > 29) {
        return false;
      }
      if ((((intYear % 100 == '0') && (intYear % 400 != '0')) || (intYear % 4 != '0')) && (intDay > '28')) {
        return false;
      }
    }
    return true;
  };
  /**
   * 特殊字符
   * @param str
   * @returns {Boolean}
   */
  commonValidate.isNotSpecial = function (str) {
    var pattern = /[`~!@#\$%\^\&\*\(\)_\+<>\?:"\{\},\.\\\/;'\[\]]/im;
    if (pattern.test(str)) {
      return false;
    }
    return true;
  };
  /**
   * 正整数
   * @param str
   * @returns {Boolean}
   */
  commonValidate.isSignlessInteger = function (str) {
    var pattern = /^\+?[1-9][0-9]*$/;
    if (pattern.test(str)) {
      return true;
    }
    return false;
  };
  /**
   * 验证输入是否是身份证号
   * @param str
   *@returns {Boolean}
   * */
  commonValidate.isCardNo = function (str) {
    // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
    var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return reg.test(str);
  };
  /**
   * 只输入汉字、数字、字母下划线的正则
   * @param str
   * @returns
   */
  commonValidate.checkInputName = function (str) {
    var re = /^(\w|[\u4E00-\u9FA5]|_|\.)+$/;
    return re.test(str);
  };

  /**
   * 获取字符串长度
   * @param str
   * @returns
   */
  commonValidate.getBytesLength = function (str) {
    return str.replace(/[^\x00-\xff]/g, "**").length;
  };
  module.exports = commonValidate;
});