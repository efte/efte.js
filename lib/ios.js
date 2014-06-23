(function() {

  var callbacksCount = 1;
  var callbacks = {};

  var isArray = Array.isArray || function(obj) {
      return obj instanceof Array;
    };

  var extend = function(obj, source) {
    if (!source) return obj;

    for (var prop in source) {
      if (source[prop] !== undefined)
        obj[prop] = source[prop];
    }

    return obj;
  };

  var noop = function() {}

  var Efte = {

    send_message: function(method, args, callback) {
      var hasCallback = callback && typeof callback == 'function';

      var callbackId = hasCallback ? callbacksCount++ : 0;

      if (hasCallback) {
        callbacks[callbackId] = callback;
      }

      args = args || {};

      args['callbackId'] = callbackId;  

      // args must an dictionary
      if (Object.prototype.toString.call(args) !== '[object Object]') {
        throw new Error('Efte.send_message: args must be an object');
      }

      args = JSON.stringify(args);

      var ifr = document.createElement('iframe');
      ifr.style.display = 'none';
      document.body.appendChild(ifr);
      ifr.contentWindow.location.href = 'js://_?method=' + method + '&args=' + encodeURIComponent(args) + '&callbackId=' + callbackId;
      // ifr.parentNode.removeChild(ifr);
      setTimeout(function() {
        ifr.parentNode.removeChild(ifr);
      }, 0);

      return callbackId;
    },

    callback: function(callbackId, retValue) {
      try {
        var callback = callbacks[callbackId];
        if (!callback) return;
        callback.apply(null, [retValue]);
        // delete callbacks[callbackId];
      } catch (e) {
        alert(e);
      }
    },

    ajax: function(opts) {
      var success = opts.success || noop;
      var error = opts.error || noop;

      // null data lead native error
      if (!opts.data) {
        delete opts.data;
      }

      var contentTypeToDataType = function (contentType) {
        var jsonType = 'application/json';
        var htmlType = 'text/html';
        var xmlTypeRE = /^(?:text|application)\/xml/i;

        if (contentType) {
          contentType = contentType.split(';', 2)[0];
        }

        return contentType && (contentType == jsonType ? 'json' : contentType == htmlType ? 'html' : xmlTypeRE.test(mime) && 'xml') || 'text';
      }

      var callbackID = Efte.send_message('ajax', opts, function(xhr) {
        var errMsg = '';
        var dataType = contentTypeToDataType(xhr.dataType);
        var result = xhr.responseText;

        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          try {
            if (dataType == 'json') {
              result = /^\s*$/.test(result) ? null : JSON.parse(result);
            }
          } catch (e) {
            error(xhr.status, 'parsererror', xhr);
            delete callbacks[callbackID];
            return;
          }

          success(result);
          delete callbacks[callbackID];
        } else {
          error(xhr.status, xhr.message);
          delete callbacks[callbackID];
        }
      });
      return {
        cancel: function() {
          delete callbacks[callbackID];
        }
      };
    },

    action: {
      get: function(callback) {
        var cid = Efte.send_message('actionGetQuery', {}, function(query) {
          if (typeof callback != 'function') return;
          callback(query);
          delete callbacks[cid];
        });
      },
      /**
       * 打开新窗口
       * @param  {[String]} unit     [description]
       * @param  {[String]} path     [description]
       * @param  {[Object]} query    [description]
       * @param  {[Boolean]} modal    [description]
       * @param  {[Boolean]} animated [description]
       */
      open: function(unit, path, query, modal, animated) {
        var opt = {
          unit: unit,
          path: path
        };

        if (Object.prototype.toString.call(query) === '[object Object]') {
          opt.query = query;
        }

        if (modal != null) {
          opt.modal = !! modal;
        }

        opt.animated = animated != null ? !! animated : true;

        var cid = Efte.send_message('actionOpen', opt, function() {
          delete callbacks[cid];
        });
      },
      back: function(animated) {
        if (animated === undefined) {
          animated = true;
        }
        var cid = Efte.send_message('actionBack', {
          animated: animated
        }, function() {
          delete callbacks[cid];
        });
      },
      dismiss: function(animated) {
        if (animated === undefined) {
          animated = true;
        }
        var cid = Efte.send_message('actionDismiss', {
          animated: animated
        }, function() {
          delete callbacks[cid];
        });
      }
    },

    getEnv: function(callback) {
      Efte.send_message('getEnv', {}, function(env) {
        window.AppEnv = window.AppEnv || {
          parseQuery: function() {
            // query not set
            if (this.query == '${query}') {
              this.query = null;
              return;
            }

            var params = {};
            this.query.split('&').forEach(function(param) {
              var kv = param.split('=');
              var k = kv[0];
              var v = kv.length > 0 ? kv[1] : '';
              params[k] = v;
            });

            this.query = params;
          }
        };

        extend(window.AppEnv, env);
        window.AppEnv.parseQuery();

        callback();
      });
    },

    startRefresh: function() {
        Efte.stopRefresh();
    },

    stopRefresh: function() {
      Efte.send_message('stopRefresh');
    },

    genUUID: function(id) {
      // buggy
      id = id || AppEnv.dpid;

      // MD5?
      var requid = CryptoJS.MD5(id + (new Date().getTime()) + (Math.random()));
      // console.log(requid.toString());
      return requid.toString();
    },
    setTitle: function(title) {
      var cid = Efte.send_message('setTitle', {
        title: title
      }, function() {
        delete callbacks[cid];
      });
    },
    takePhoto: function(callback) {
      var cid = Efte.send_message('imagePicker', {}, function(result) {
        typeof callback == 'function' && callback(result);
        delete callbacks[cid];
      });
    },
    takePhotoByName: function(name, callback, fail) {
      var cid = Efte.send_message('imagePickerWithName', {name: name}, function (result) {
        if (result.image) {
          typeof callback == 'function' && callback(result.image);
        } else {
          typeof fail == 'function' && fail(result.message);
        }
        delete callbacks[cid];
      })
    },

    // 设置导航栏按钮
    /**
     * [{
     *  title: 'Foo',
     *  action: function () {}
     * }]
     */
    setBarButtons: function(buttons) {
      buttons = isArray(buttons) ? buttons : [buttons];
      var actionFns = [];
      buttons.forEach(function(button) {
        actionFns.push(button.action || noop);
      });
      Efte.send_message('setBarButtons', {
        buttons: buttons
      }, function(result) {
        actionFns[result.index]();
      });
    },

    /* notification publish & subscribe */
    publish: function(name, value) {
      Efte.send_message('publish', {
        name: name,
        value: value
      });
    },

    /* callback(publisher's value); */
    subscribe: function(name, callback) {
      var cid = Efte.send_message('subscribe', {
        name: name
      }, function(result) {
        (typeof callback == 'function') && callback(result.value);
      });
      return {
        unsubscribe: function() {
          delete callbacks[cid];
        }
      }
    },

    multilevel: function(options, values, callback) {
      Efte.send_message('multilevel', {
        options: options,
        values: values
      }, callback)
    },
    /**
     * datePicker
     * @options  {Object}   options    [description]
     * 
     *  type: {String} date|time|datetime(default)
     *  default: {String} 2014-11-11 12:12:12(default) | 2014-11-11 | 12:12:12
     *  ...
     *  
     * @callback  {Function} callback [description]
     * 
     */
    datePicker: function (type, defaultDate, callback) {
      Efte.send_message('datepicker', {
        'type': type || '',
        'default': defaultDate || '' 
      }, callback);
    }
  };

  try {
    module.exports = Efte;
  } catch (e) {
    window.Efte = Efte;
  }

})();
