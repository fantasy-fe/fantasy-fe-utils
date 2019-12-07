/**
 * component hub
 */
define('jsBasePath/common/component-hub', function (require, exports, module) {
  var COMPONENT_ATTR = 'data-component';
  var SELECTOR_CONTAINER = '[' + COMPONENT_ATTR + ']';
  var sn = 0;
  var stamp = function (el) {
    var id = el.attr('id');
    if (!id) {
      id = 'component-' + (sn++);
      el.attr('id', id);
    }
    return id;
  };
  var locateComponentModule = function (id) {
    var uri;
    var cache = window.seajs.cache;
    for (uri in cache) {
      if (cache[uri].id === id) {
        return cache[uri].exec();
      }
    }
  };

  /**
   * component manager
   * @class
   * @static
   */
  var ComponentHub = {
    instances: {},
    /**
     * boot components in the specific container
     * @method
     * @param {HTMLElement|Selector|ZeptoCollection} el
     */
    boot: function (el) {
      $(el || 'body').find(SELECTOR_CONTAINER).each(function () {
        var instance;
        var el = $(this);
        extendsOn(el);
        var idAttr = stamp(el);
        var name = el.attr(COMPONENT_ATTR);
        var id = ['componentsBasePath', name, name].join('/');
        var Component = locateComponentModule(id);
        if (!Component) {
          return;
        }
        instance = new Component(el);
        instance.name = name;
        ComponentHub.instances[idAttr] = instance;
      });
    },
    /**
     * get component instances by name
     * @method
     * @param {String} name
     * @return {[Object]}
     */
    getComponentsByName: function (name) {
      var list = [];
      var id;
      for (id in ComponentHub.instances) {
        if (ComponentHub.instances[id].name === name) {
          list.push(ComponentHub.instances[id]);
        }
      }
      return list;
    },
    /**
     * get component instance by id
     * @method
     * @param {String} id
     * @return {Object}
     */
    getComponentById: function (id) {
      var prop;
      for (prop in ComponentHub.instances) {
        if (prop === id) {
          return ComponentHub.instances[prop];
        }
      }
    },
    /**
     * get component instance by element
     * @method
     * @param {ZeptoCollection} el
     * @return {Object}
     */
    getComponentByElement: function (el) {
      var id;
      for (id in ComponentHub.instances) {
        if (ComponentHub.instances[id].el === el) {
          return ComponentHub.instances[id];
        }
      }
    },
    /**
     * 动态增加组件
     * @param name
     */
    appendComponentsByName: function (name) {
      var id = ['componentsBasePath', name, name].join('/');
      var Component = locateComponentModule(id);
      if (!Component) {
        return;
      }
      var el = $('body');
      extendsOn(el);
      var instance = new Component(el);
      instance.name = name;
      ComponentHub.instances[name] = instance;
    }
  };
  // on函数事件绑定前off一下
  function extendsOn(el) {
    el.originOn = el.on;
    el.on = function () {
      if (arguments.length === 1) {
        for (var i in arguments[0]) {
          el.off(i);
        }
        el.originOn(arguments[0]);
      } else if (arguments.length === 2) {
        el.off(arguments[0]);
        el.originOn(arguments[0], arguments[1]);
      } else if (arguments.length === 3) {
        el.off(arguments[0]);
        el.originOn(arguments[0], arguments[1], arguments[2]);
      }
    };
  }

  module.exports = ComponentHub;
});
