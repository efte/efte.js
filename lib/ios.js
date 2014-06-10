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
                // delete callbacks[callbackId];
            } catch (e) {
                alert(e);
            }
        },

        ajax: function(opts) {
            var success = opts.success || function() {};
            var fail = opts.fail || function() {};

            var callbackID = Efte.send_message('ajax', opts, function(json) {
                var errMsg = '';
                if (json.code == 0) {
                    var rsp = null;
                    try {
                        rsp = JSON.parse(json.responseText);
                        success(rsp);
                        delete callbacks[callbackID];
                    } catch (e) {
                        fail(-2, 'parse json error: ' + e.message);
                        console.log(json);
                        delete callbacks[callbackID];
                    }
                } else {
                    fail(json.code, json.message);
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
            get: function (callback) {
                var cid = Efte.send_message('actionGetQuery', {}, function(query) {
                    if (typeof callback != 'function') return;
                    callback(query);
                    delete callbacks[cid];
                });
            },
            open: function(unit, path, query, modal, animated) {
                modal = !!modal;
                if (animated === undefined) {
                    animated = true;
                }
                var cid = Efte.send_message('actionOpen', {
                    unit: unit,
                    path: path,
                    query: query,
                    modal: modal,
                    animated: animated
                }, function () {
                    delete callbacks[cid];
                });
            },
            back: function(animated) {
                if (animated === undefined) {
                    animated = true;
                }
                var cid = Efte.send_message('actionBack', {
                    animated: animated
                }, function () {
                    delete callbacks[cid];
                });
            },
            dismiss: function (animated) {
                if (animated === undefined) {
                    animated = true;
                }
                var cid = Efte.send_message('actionDismiss', {
                    animated: animated
                }, function () {
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

        /*
        startRefresh: function() {
            // override this method plz
        },
        */

        stopRefresh: function() {
            Efte.send_message('stopRefresh', {}, function() {});
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
            }, function () {
                delete callbacks[cid];
            });
        },
        takePhoto: function(callback) {
            var cid = Efte.send_message('imagePicker', {}, function(result) {
                typeof callback == 'function' && callback(result && result.image);
                delete callbacks[cid];
            });
        },

        // 设置导航栏按钮
        /**
         * [{
         *  title: 'Foo',
         *  action: function () {}
         * }]
         */
        setBarButtons: function (buttons) {
            buttons = isArray(buttons) ? buttons : [buttons];
            var actionFns = [];
            buttons.forEach(function (button) {
                actionFns.push(button.action || function () {});
            });
            Efte.send_message('setBarButtons', {
                buttons: buttons
            }, function (result) {
                actionFns[result.index]();
            });
        }
    };

    try {
        module.exports = Efte;
    } catch (e) {
        window.Efte = Efte;
    }

})();
