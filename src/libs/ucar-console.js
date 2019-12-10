/**
 * Created by JetBrains PhpStorm.
 * User: shuaibin.li
 * Date: 15-11-26
 * Time: 上午10:16
 * To change this template use File | Settings | File Templates.
 */
define('jsBasePath/common/ucar-console', function (require, exports, module) {
  var timeMap = {};
  var _consoleStack = [];
  var _filter = { "INFO": 1, "WARN": 1 };
  var _consoleWindow;
  var isOpened = false;
  //自定义控制台
  var ucar_console = {
    info: new _pushToStack("INFO"),
    error: new _pushToStack("ERROR"),
    warn: new _pushToStack("WARN"),
    time: new _pushToStack("TIME"),
    trace: new _pushToStack("TRACE")
  };

  module.exports = ucar_console;

  function _pushToStack(level) {
    if (!_filter[level]) {
      return function () {
        _consoleStack.push(arguments);
        refreshConsole();
      };
    } else {
      return function () {
        _consoleStack.push(level + ': ', arguments);
        refreshConsole();
      };
    }
  }

  function refreshConsole() {
    if (isOpened && _consoleWindow[0]) {
      var _html = getConsoleInfo();
      _consoleWindow.html(_html.join('<br />'));
    }
  }
  function getConsoleInfo() {
    var str = [];
    for (var i = 0; i < _consoleStack.length; i++) {
      var line = [];
      var args = _consoleStack[i];
      for (var j = 0; j < args.length; j++) {
        line.push(args[j]);
      }
      str.push(line.join(''));
    }
    return str;
  }
  ucar_console.start = function (key) { timeMap[key] = new Date(); };
  ucar_console.end = function (key) {
    if (timeMap[key]) {
      ucar_console.time("[TIME]: ", key, " ", new Date() - timeMap[key], 'ms');
      delete timeMap[key];
    }
  };

  ucar_console.output = function () {
    var _html = getConsoleInfo();

    _consoleWindow = $('#divUcarConsole');
    if (_consoleWindow[0]) {
      _consoleWindow.html(_html.join('<br />'));
      _consoleWindow.show();
      isOpened = true;
    } else {
      alert(_html.join('\r\n'));
    }
  };

  ucar_console.close = function () {
    if (_consoleWindow && _consoleWindow[0]) {
      _consoleWindow.hide();
      isOpened = false;
    }
  };

  $(document).keydown(function (ev) {
    if ((ev.keyCode == 121 && ev.ctrlKey && ev.altKey)) {
      if (isOpened) {
        ucar_console.close();
      } else {
        ucar_console.output();
      }
    }
  });

  var num = 0;
  var t;
  $(document).on('touchstart', function () {
    t = setInterval(function () {
      num++;
    }, 1000);
  });
  $(document).on('touchend', function () {
    clearInterval(t);
    if (num >= 3) {
      if (isOpened) {
        ucar_console.close();
      } else {
        ucar_console.output();
      }
      num = 0;
    }
  });
  $(document).on('click', function () {
    ucar_console.close();
  });
});