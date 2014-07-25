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

  var callbackDelegate = function(callback, args) {
    if (typeof callback === 'function') {
      callback.apply(null, args)
    }
  };

  var gaCallbackDelegate = function(success, error, data, defaultMsg) {
    if (!data || !data.status) {
      callbackDelegate(error, [data.message || defaultMsg]);
    } else {
      callbackDelegate(success, [data.message || '']);
    }
  };

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
      ifr.contentWindow.location.href = 'js://_?method=' + method + '&args=' + encodeURIComponent(args) + '&callbackId=' + callbackId + '&stamp=' + (new Date()).getTime();
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

      var contentTypeToDataType = function(contentType) {
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

        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && opts.url.indexOf('efte:') == 0)) {
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
        abort: function() {
          delete callbacks[callbackID];
        },

        cancel: function() {
          // deprecated, use abort instead
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
          opt.modal = !!modal;
        }

        opt.animated = animated != null ? !!animated : true;

        var cid = Efte.send_message('actionOpen', opt, function() {
          delete callbacks[cid];
        });
      },

      openUrl: function(url, modal, animated) {
        Efte.send_message('openUrl', {
          url: url,
          modal: modal,
          animated: animated
        });
      },

      willBack: function() {
        return true;
      },

      back: function(animated) {
        if (Efte.action.willBack() === false) {
          return;
        }

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
        window.AppEnv = env;
        callback(env && env.value);
      });
    },

    enableRefresh: function() {
      Efte.send_message('enableRefresh');
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
      var cid = Efte.send_message('imagePickerWithName', {
        name: name
      }, function(result) {
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

    multilevelFromResource: function(unit, path, values, callback) {
      Efte.send_message('multilevel', {
        unit: unit,
        path: path,
        values: values
      }, function(result) {
        (typeof callback == 'function') && callback(result.value);
      })
    },

    multilevel: function(options, values, callback) {
      Efte.send_message('multilevel', {
        options: options,
        values: values
      }, function(result) {
        (typeof callback == 'function') && callback(result.value);
      })
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
    datePicker: function(type, defaultDate, callback) {
      Efte.send_message('datepicker', {
        'type': type || '',
        'default': defaultDate || ''
      }, function(result) {
        (typeof callback == 'function') && callback(result.value);
      });
    },

    logout: function() {
      Efte.send_message('logout');
    },

    geo: {
      getCurrentPosition: function(success, error) {
        Efte.send_message('location', {}, function(position) {
          if (!position || !position.status) {
            error(position.message || '定位失败');
          } else {
            success(position);
          }
        });
      }
    },
    showPhoto: function(data, delCallback) {
      Efte.send_message('showPhoto', data, function(retValue) {
        if (retValue && retValue.action && retValue.action == 'del') {
          delCallback();
        }
      });
    },
    ga: {
      sendEvent: function(category, action, label, value, success, error) {
        Efte.send_message('ga_sendEvent', {
          category: category,
          action: action,
          label: label,
          value: value
        }, function(data) {
          gaCallbackDelegate(success, error, data, 'ga send event 失败');
        });
      },
      sendView: function(viewName, success, error) {
        Efte.send_message('ga_sendView', {
          viewName: viewName
        }, function(data) {
          gaCallbackDelegate(success, error, data, 'ga send view 失败');
        });
      },
      sendTiming: function(category, interval, name, label, success, error) {
        Efte.send_message('ga_sendTiming', {
          category: category,
          interval: interval,
          name: name,
          label: label
        }, function(data) {
          gaCallbackDelegate(success, error, data, 'ga send timing 失败');
        });
      },
      sendException: function(description, fatal, success, error) {
        Efte.send_message('ga_sendException', {
          description: description,
          fatal: fatal
        }, function(data) {
          gaCallbackDelegate(success, error, data, 'ga send exception 失败');
        });
      },
      setCustomDimension: function(dimentionIndex, value, success, error) {
        Efte.send_message('ga_setCustomDimension', {
          dimentionIndex: dimentionIndex,
          value: value
        }, function(data) {
          gaCallbackDelegate(success, error, data, 'ga set custom dimension 失败');
        });
      },
      setCustomMetric: function(metricIndex, value, success, error) {
        Efte.send_message('ga_setCustomMetric', {
          metricIndex: metricIndex,
          value: value
        }, function(data) {
          gaCallbackDelegate(success, error, data, 'ga set custom metric 失败');
        });
      }
    },
    cache: {
      save: function(key, value, opts) {
        var params = {
          key: key,
          value: value,
          isTemp: !!opts.isTemp
        };

        if (opts.expiration != null) {
          params.expiration = opts.expiration;
        }

        Efte.send_message('cacheSave', params, function(data) {
          if (!data || !data.status) {
            callbackDelegate(opts.error, [data.message || 'cache保存失败']);
            return;
          }
          callbackDelegate(opts.success, [data.message || 'cache保存成功']);
        });
      },

      load: function(key, opts) {
        Efte.send_message('cacheLoad', {
          key: key
        }, function(data) {
          if (!data || !data.status) {
            callbackDelegate(opts.error, [data.message || 'cache读取失败']);
            return;
          }
          callbackDelegate(opts.success, [data]);
        });
      },
      remove: function(key, opts) {
        Efte.send_message('cacheDelete', {
          key: key
        }, function(data) {
          if (!data || !data.status) {
            callbackDelegate(opts.error, [data.message || 'cache删除失败']);
            return;
          }
          callbackDelegate(opts.success, [data]);
        });
      }
    }
  };

  try {
    module.exports = Efte;
  } catch (e) {
    window.Efte = Efte;
  }

})();
