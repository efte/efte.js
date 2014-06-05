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

    var Efte = {
        NVCacheTypeDisabled: 0,
        NVCacheTypeNormal: 1,
        NVCacheTypePersistent: 2,
        NVCacheTypeCritical: 3,
        NVCacheTypeDaily: 4,

        send_message: function(method, args, callback) {
            // console.log('send_message', arguments);
            var hasCallback = callback && typeof callback == 'function';
            var callbackId = hasCallback ? callbacksCount++ : 0;
            if (hasCallback) callbacks[callbackId] = callback;

            args['callbackId'] = callbackId;
            args = (typeof args === 'object') ? JSON.stringify(args) : args + '';
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
                delete callbacks[callbackId];
            } catch (e) {
                alert(e);
            }
        },

        ga: function(category, action, label, value, extra) {
            this.send_message('ga', {
                category: category,
                action: action,
                label: label || '',
                value: value || 0,
                extra: extra || {}
            }, function() {});
        },

        ajax: function(opts) {
            var url = opts.url;
            var data = opts.data || {};
            var success = opts.success || function() {};
            var fail = opts.fail || function() {};

            var params = [];
            for (var p in data) {
                if (data.hasOwnProperty(p)) {
                    params.push(p + '=' + encodeURIComponent(data[p]));
                }
            }

            if (params.length) {
                url += url.indexOf('?') == -1 ? "?" : "&";
                url += params.join('&');
            }

            opts.url = url;

            var callbackID = this.send_message('ajax', opts, function(json) {
                var errMsg = '';
                if (json.code === 0) {
                    var rsp = null;
                    try {
                        rsp = JSON.parse(json.responseText);
                        success(rsp);
                    } catch (e) {
                        fail(-2, 'parse json error: ' + e.message);
                        console.log(json);
                    }
                } else {
                    fail(json.code, json.message);
                }
            });
            return {
                cancel: function() {
                    delete callbacks[callbackID];
                }
            };
        },

        action: {
            get: function(params, callback) {
                this.send_message('getURLActionObjects', {
                    params: isArray(params) ? params : [params]
                }, function(objs) {
                    if (typeof callback != 'function') return;
                    if (isArray(params)) {
                        callback(objs);
                    } else {
                        var obj = null;
                        for (var i in objs) {
                            if (objs.hasOwnProperty(i)) {
                                obj = objs[i];
                                break;
                            }
                        }
                        callback(obj);
                    }
                });
            },
            open: function(unit, path, params) {
                this.send_message('openURLAction', {
                    unit: unit,
                    path: path,
                    params: params
                }, function() {});
            }
        },

        getEnv: function(callback) {
            this.send_message('getEnv', {}, function(env) {
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
            // override this method plz
        },
        stopRefresh: function() {
            this.send_message('stopRefresh', {}, function() {});
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
            this.send_message('setTitle', {
                title: title
            });
        },
        takePhoto: function(callback) {
            this.send_message('imagePicker', {}, function(result) {
                typeof callback == 'function' && callback(result && result.image);
            });
        }
    };
})();
