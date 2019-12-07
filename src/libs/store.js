define('jsBasePath/store/store', function (require, exports, module) {
  var storage = require('jsBasePath/store/storage');
  // var utils = require('jsBasePath/common/utils');

  var appData = storage.get() || {};
  var ROOT_KEY = '$root';
  var SCHEMA = {
    type: 'object',
    description: '根节点',
    properties: {
      session: {
        type: 'object',
        description: 'session 数据节点',
        properties: {
          index: {
            type: 'object',
            description: '首页信息',
            properties: {
              title: {
                type: 'string',
                description: '页面标题',
              },
              serviceType: {
                type: 'string',
                description: '服务类型，例如 immediate、half、receive、send 等',
              },
              serviceTypeId: {
                type: 'string',
                description: '服务类型 ID',
              },
            },
          },
          flightInfo: {
            type: 'object',
            description: '航班信息',
          },
          priceDetail: {
            type: 'object',
            description: '估价信息',
          },
          cityInfo: {
            type: 'object',
            description: 'geo定位城市信息'
          },
          jsApiConfig: {
            type: 'object',
            description: 'dingding jsApiConfig',
          },
          giftInfo: {
            type: 'object',
            description: '充赠信息'
          }
        },
      },
      userInfo: {
        type: 'object',
        description: '用户信息',
      },
      currUserInfo: {
        type: 'object',
        description: '当前登录用户信息',
      },
      order: {
        type: 'object',
        description: '下单信息',
      },
      priceDetail: {
        type: 'object',
        description: '估价信息',
      },
      flightHistory: {
        type: 'object',
        description: '搜索航班号缓存',
      },
      geoInfo: {
        type: 'object',
        description: 'geo定位信息'
      }
    },
  };

  var normalize = function () {
    var args = Array.prototype.slice.call(arguments);
    return args.reduce(function (list, item) {
      if ($.isArray(item)) {
        return list.concat(normalize.apply(null, item));
      }

      if (item) {
        list.push(item);
      }
      return list;
    }, []).join('.');
  };
  var isSessionKey = function (key) {
    return key.indexOf('session.') === 0;
  };
  /**
   * 检查数据是否符合规范。规则为：
   * - 如果数据最后一级在 SCHEMA 中已定义，则检查是否符合规范
   * - 否则，如果数据的倒数第二级（非顶级）在 SCHEMA 中已定义，且类型为 object
   * - 上述两条都不成立，返回 false
   */
  var validate = function (key, value) {
    if (key === ROOT_KEY) {
      return typeof value === SCHEMA.type;
    }

    var parts = key.split('.');
    var last = parts.pop();
    var schema = parts.reduce(function (obj, part) {
      return obj && obj.properties ? obj.properties[part] : null;
    }, SCHEMA);

    if (schema && schema.properties && schema.properties[last]) {
      return typeof value === schema.properties[last].type;
    } else if (schema && schema !== SCHEMA) {
      return schema.type === 'object';
    }
    return false;
  };

  var store = {
    listeners: {},
    oldValues: {},
    notifyTimer: null,
    get: function (key) {
      if (!key || key === ROOT_KEY) return appData;

      var parts = key.split('.');
      return parts.reduce(function (obj, part) {
        return obj ? obj[part] : null;
      }, appData);
    },
    set: function (key, value, prefix) {
      var syncTarget = {
        local: false,
        session: false,
      };
      var assign = function (k, v) {
        k = normalize(prefix, k);
        if (UCar.debug && !validate(k, v)) {
          throw new Error('store: 参数不符合规范，请检查 ' + k + ':' + v + '（请在store/store.js文件中增加该属性定义）');
        }

        var parts = k.split('.');
        var last = parts.pop();
        var o = parts.reduce(function (obj, part) {
          obj[part] = obj[part] || {};
          return obj[part];
        }, appData);
        o[last] = v;

        if (isSessionKey(k)) {
          syncTarget.session = true;
        } else {
          syncTarget.local = true;
        }
      };

      if ($.isPlainObject(key)) {
        // 未使用递归以减少 sync 调用
        $.each(key, assign);
      } else {
        assign(key, value);
      }

      this.sync(syncTarget);
    },
    remove: function (key) {
      var parts = key.split('.');
      var last = parts.pop();
      var o = parts.reduce(function (obj, part) {
        return obj ? obj[part] : null;
      }, appData);
      if (!o) return;

      delete o[last];

      var sessionChange = isSessionKey(key);
      this.sync({
        local: !sessionChange,
        session: sessionChange,
      });
    },
    reset: function (data) {
      appData = data || {};

      this.sync({
        local: true,
        session: true,
      });
    },
    sync: function (syncTarget) {
      if (syncTarget.local) {
        storage.setLocal(appData);
      }
      if (syncTarget.session) {
        storage.setSession(appData.session);
      }

      this.notify();
    },
    subscribe: function (key, listener, execImmidiately) {
      if (typeof key === 'function') {
        execImmidiately = listener;
        listener = key;
        key = ROOT_KEY;
      }

      var listeners = this.listeners;
      var oldValues = this.oldValues;
      listeners[key] = listeners[key] || [];
      listeners[key].push(listener);
      oldValues[key] = this.get(key);

      if (execImmidiately) {
        listener();
      }

      return {
        unsubscribe: function () {
          var index = listeners[key].indexOf(listener);
          listeners[key].splice(index, 1);
          if (listeners[key].length === 0) {
            delete listeners[key];
            delete oldValues[key];
          }
        },
      };
    },
    notify: function () {
      if (this.notifyTimer) return;

      this.notifyTimer = setTimeout(function () {
        this.notifyTimer = null;
        this.flushNotify();
      }.bind(this), 0);
    },
    flushNotify: function () {
      var self = this;
      var candidates = [];

      $.each(this.listeners, function (key) {
        var oldVal = self.oldValues[key];
        var val = self.get(key);
        // utils.log('store.flushNotify: compare value', key, oldVal, val);
        if (val === oldVal) return;

        self.oldValues[key] = val;
        // 遍历所有上层数据
        // 例如 order.price 发生变化，则会通知监听根节点、order 和 order.price 的监听函数
        var parts = key.split('.');
        while (parts.length > 0) {
          var k = parts.join('.');
          (self.listeners[k] || []).forEach(function (listener) {
            if (listener && candidates.indexOf(listener) === -1) {
              candidates.push(listener);
            }
          });
          parts.pop();
        }
      });

      candidates.forEach(function (listener) {
        listener();
      });
    },
    cursor: function (prefix) {
      return {
        get: function (key) {
          return store.get(normalize(prefix, key));
        },
        set: function (key, value) {
          store.set(key, value, prefix);
        },
        remove: function (key) {
          store.remove(normalize(prefix, key));
        },
        reset: function (data) {
          store.set(prefix, data || {});
        },
        subscribe: function (key, listener, execImmidiately) {
          if (typeof key === 'function') {
            execImmidiately = listener;
            listener = key;
            key = undefined;
          }
          return store.subscribe(normalize(prefix, key), listener, execImmidiately);
        },
      };
    },
  };

  module.exports = store;
});
