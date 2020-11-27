import Env from './env'
import { Base64 } from 'js-base64';
declare global {
  interface Window { WebViewJavascriptBridge: any, WVJBCallbacks: any, CustomEvent: any, Event: any }
}


interface CallNative {
  protocol: string,//协议
  parameters: any,//参数
  callBack(res: any)//回调
}

/**
 * CustomEvent pollyfill 
 */
(function () {
  try {
    // a : While a window.CustomEvent object exists, it cannot be called as a constructor.
    // b : There is no window.CustomEvent object
    new window.CustomEvent('T');
  } catch (e) {
    var CustomEvent = function (event, params) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };

      var evt = document.createEvent('CustomEvent');

      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

      return evt;
    };

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
  }
})();

export default class JSBridge {
  static handles = {};
  static jsbridgeId = 1;
  /**
   * 初始化事件需要
   * @param callback 
   */
  static initJSBridge(callback) {

    if (window.WebViewJavascriptBridge) { return callback(window.WebViewJavascriptBridge); }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'https://__bridge_loaded__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function () { document.documentElement.removeChild(WVJBIframe) }, 0)

  }



  static jsCallNative(params: CallNative) {
    try {
      const osInfo = Env.getOSInfo();
      if (osInfo) {
        if (osInfo.isIOS) {
          JSBridge.initJSBridge(function () {
            if (window.WebViewJavascriptBridge) {
              window.WebViewJavascriptBridge.callHandler('UCARJSCallNative', {
                'protocol': params.protocol,
                'parameters': params.parameters,
              }, params.callBack);
            }
          })
        } else if (osInfo.isAndroid || osInfo.isAndroidPad) {

          if (window.WebViewJavascriptBridge) {
            window.WebViewJavascriptBridge.callHandler('UCARJSCallNative', {
              'protocol': params.protocol,
              'parameters': params.parameters,
            }, params.callBack);
          } else {
            document.addEventListener(
              'WebViewJavascriptBridgeReady'
              , function () {
                window.WebViewJavascriptBridge.callHandler('UCARJSCallNative', {
                  'protocol': params.protocol,
                  'parameters': params.parameters,
                }, params.callBack);
              },
              false
            );
          }
        }
      }
    } catch (error) {
      console.log(`error:nativeCallJS ${error}`)
    }



  }


  static nativeCallJS() {
    try {
      const osInfo = Env.getOSInfo();
      if (osInfo) {
        if (osInfo.isIOS) {
          JSBridge.initJSBridge(function () {
            if (window.WebViewJavascriptBridge) {
              window.WebViewJavascriptBridge.registerHandler('UCARNativeCallJS', function (data: CallNative, responseCallback) {

                JSBridge.triggerHandler({ protocol: data.protocol, parameters: data.parameters, callBack: responseCallback })
              });
            }
          });

        } else if (osInfo.isAndroid || osInfo.isAndroidPad) {
          if (window.WebViewJavascriptBridge) {

            window.WebViewJavascriptBridge.registerHandler('UCARNativeCallJS', function (data, responseCallback) {
              //data = JSON.parse(data);
              //data = JSON.parse(data);
              data = JSON.parse(Base64.decode(data));
              JSBridge.triggerHandler({ protocol: data.protocol, parameters: data.parameters, callBack: responseCallback })
            });
          } else {
            document.addEventListener(
              'WebViewJavascriptBridgeReady'
              , () => {
                window.WebViewJavascriptBridge.registerHandler('UCARNativeCallJS', function (data, responseCallback) {
                  //responseCallback({ 'name': 'liying' })
                  //data = JSON.parse(data);
                  data = JSON.parse(Base64.decode(data));
                  //const parameters = Base64.decode(data.parameters)
                  //$('#data-info').text(JSON.stringify(data.parameters))

                  JSBridge.triggerHandler({
                    protocol: data.protocol,
                    //protocol: 'native',
                    parameters: data.parameters,
                    // parameters: { data: 'liying' },
                    callBack: responseCallback
                  })
                });
              },
              false
            );
          }
        }


      }
    } catch (error) {
      console.log(`error:nativeCallJS ${error}`)
    }


  }

  /**
   * 用于包装 removeEventListener 移除需要绑定 listener 函数引用，
   * @param params 
   */
  static handleCallBack(params) {

    let handle = function (e: CustomEvent) {
      let responseData = params.callBack(e.detail.parameters);
      e.detail.callBack(responseData)
    }
    JSBridge.handles[params.protocol] = handle;
    return handle;
  }


  /**
   * 注册回调 让native 主动调用
   * @param params 
   */
  static registerHandler(params: CallNative) {
    try {
      //添加off 保证同一事件绑定不重复


      if (JSBridge.handles[params.protocol]) {
        document.removeEventListener(params.protocol, JSBridge.handles[params.protocol]);
        delete JSBridge.handles[params.protocol];
      }

      document.addEventListener(params.protocol, JSBridge.handleCallBack(params));




      /* $(document).off(params.protocol).on(params.protocol, function (e, data) {
        //let realData = data.data;
        console.log(e)
        let responseData = params.callBack(data.parameters);

        data.callBack(responseData)
      }) */

    } catch (error) {
      console.log(`error:registerHandler ${error}`)
    }

  }

  /**
   * 分发自定义事件
   * @param params 
   */
  static triggerHandler(params: CallNative) {

    //Toast.info(JSON.stringify(params), 5)
    //$(document).trigger(params.protocol, params)
    var event = new window.CustomEvent(params.protocol, { detail: params });
    document.dispatchEvent(event);
  }
  /**
   * 处理js 调用native android ios 返回数据格式兼容
   * @param data 
   */
  static handleData(data) {
    try {
      const osInfo = Env.getOSInfo();
      return (osInfo && (osInfo.isAndroid || osInfo.isAndroidPad)) ? JSON.parse(Base64.decode(data)) : data

    } catch (error) {
      console.log(`error:handleData ${error}`)
    }
  }

  /**
   * 通用给native 数据传送封装
   * @param data 
   */
  static succData(data) {
    return {
      'status': {
        'success': true,
        'error': {},
      },
      'data': data
    }
  }
  /**
   * 通用给native 数据传送封装
   * @param data 
   */
  static errData(error) {
    return {
      'status': {
        'success': false,
        'error': error,
      },
      'data': {}
    }
  }
}
JSBridge.nativeCallJS();
 /* static nativeCallJS () {
    if (window.WebViewJavascriptBridge) {
      window.WebViewJavascriptBridge.registerHandler('UCARNativeCallJS', function (data: CallNative, responseCallback) {
        var event = new window.CustomEvent(data.protocol, { detail: { data: data.parameters, callBack: responseCallback } });
        document.dispatchEvent(event);
      });
    }
  }

  static registerHandler (params: CallNative) {
    document.addEventListener(params.protocol, function (e: CustomEvent) {
      let responseData = params.callBack(e.detail.parameters);
      e.detail.callBack(responseData)
    });
  } */


  /*  
  native 调用 js  data 参数
  {
     'protocol': 'name',
     'parameters': {}
     }
  } 
 */
/* 

 */
/* var event; // The custom event that will be created

if (document.createEvent) {
  event = document.createEvent("HTMLEvents");
  event.initEvent("dataavailable", true, true);
} else {
  event = document.createEventObject();
  event.eventType = "dataavailable";
}

event.eventName = "dataavailable";

if (document.createEvent) {
  element.dispatchEvent(event);
} else {
  element.fireEvent("on" + event.eventType, event);
} */

/* // Add an event listener
document.addEventListener("name-of-event", function(e) {
  console.log(e.detail); // Prints "Example of an event"
});

// Create the event
var event = new CustomEvent("name-of-event", { "detail": "Example of an event" });

// Dispatch/Trigger/Fire the event
document.dispatchEvent(event); */