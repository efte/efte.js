var main = {};
var modules = {};
modules['4'] = {};
modules['3'] = {};
modules['2'] = {};
modules['1'] = {};
(function(exports) {
    (function() {
        var $ajax = function() {
            return ajax;

            function ajax(options) {
                var settings = $.extend({
                    type: 'GET',
                    accepts: {
                        script: 'text/javascript, application/javascript, application/x-javascript',
                        json: 'application/json',
                        xml: 'application/xml, text/xml',
                        html: 'text/html',
                        text: 'text/plain'
                    },
                    timeout: 0,
                    processData: true
                }, options || {});
                if (!settings.url)
                    settings.url = window.location.toString();
                var dataType = settings.dataType,
                    ajaxSuccess = settings.success,
                    ajaxError = settings.error,
                    hasPlaceholder = /\?.+=\?/.test(settings.url);
                var mime = settings.accepts[dataType],
                    headers = {}, setHeader = function(name, value) {
                        headers[name.toLowerCase()] = [
                            name,
                            value
                        ];
                    }, xhr = new window.XMLHttpRequest(),
                    nativeSetHeader = xhr.setRequestHeader;
                setHeader('Accept', mime || '*/*');
                if (mime = settings.mimeType || mime) {
                    if (mime.indexOf(',') > -1)
                        mime = mime.split(',', 2)[0];
                    xhr.overrideMimeType && xhr.overrideMimeType(mime);
                }
                if (settings.contentType || settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET')
                    setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');
                if (settings.headers)
                    for (name in settings.headers)
                        setHeader(name, settings.headers[name]);
                xhr.setRequestHeader = setHeader;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        xhr.onreadystatechange = function() {};
                        var result, error = false;
                        if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                            result = xhr.responseText;
                            try {
                                result = /^\s*$/.test(result) ? null : JSON.parse(result);
                            } catch (e) {
                                error = e;
                            }
                            if (error)
                                ajaxError && ajaxError(error, 'parsererror', xhr, settings);
                            else
                                ajaxSuccess(result, xhr, settings);
                        } else {
                            ajaxError && ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings);
                        }
                    }
                };
                xhr.open(settings.type, settings.url, true, settings.username, settings.password);
                for (name in headers)
                    nativeSetHeader.apply(xhr, headers[name]);
                xhr.send(settings.data ? settings.data : null);
                return xhr;
            }
        }();
        var md5 = function() {
            var hexcase = 0;
            var b64pad = '';

            function hex_md5(s) {
                return rstr2hex(rstr_md5(str2rstr_utf8(s)));
            }

            function b64_md5(s) {
                return rstr2b64(rstr_md5(str2rstr_utf8(s)));
            }

            function any_md5(s, e) {
                return rstr2any(rstr_md5(str2rstr_utf8(s)), e);
            }

            function hex_hmac_md5(k, d) {
                return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)));
            }

            function b64_hmac_md5(k, d) {
                return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)));
            }

            function any_hmac_md5(k, d, e) {
                return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e);
            }

            function md5_vm_test() {
                return hex_md5('abc').toLowerCase() == '900150983cd24fb0d6963f7d28e17f72';
            }

            function rstr_md5(s) {
                return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
            }

            function rstr_hmac_md5(key, data) {
                var bkey = rstr2binl(key);
                if (bkey.length > 16)
                    bkey = binl_md5(bkey, key.length * 8);
                var ipad = Array(16),
                    opad = Array(16);
                for (var i = 0; i < 16; i++) {
                    ipad[i] = bkey[i] ^ 909522486;
                    opad[i] = bkey[i] ^ 1549556828;
                }
                var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
                return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
            }

            function rstr2hex(input) {
                try {
                    hexcase;
                } catch (e) {
                    hexcase = 0;
                }
                var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
                var output = '';
                var x;
                for (var i = 0; i < input.length; i++) {
                    x = input.charCodeAt(i);
                    output += hex_tab.charAt(x >>> 4 & 15) + hex_tab.charAt(x & 15);
                }
                return output;
            }

            function rstr2b64(input) {
                try {
                    b64pad;
                } catch (e) {
                    b64pad = '';
                }
                var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var output = '';
                var len = input.length;
                for (var i = 0; i < len; i += 3) {
                    var triplet = input.charCodeAt(i) << 16 | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
                    for (var j = 0; j < 4; j++) {
                        if (i * 8 + j * 6 > input.length * 8)
                            output += b64pad;
                        else
                            output += tab.charAt(triplet >>> 6 * (3 - j) & 63);
                    }
                }
                return output;
            }

            function rstr2any(input, encoding) {
                var divisor = encoding.length;
                var i, j, q, x, quotient;
                var dividend = Array(Math.ceil(input.length / 2));
                for (i = 0; i < dividend.length; i++) {
                    dividend[i] = input.charCodeAt(i * 2) << 8 | input.charCodeAt(i * 2 + 1);
                }
                var full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
                var remainders = Array(full_length);
                for (j = 0; j < full_length; j++) {
                    quotient = Array();
                    x = 0;
                    for (i = 0; i < dividend.length; i++) {
                        x = (x << 16) + dividend[i];
                        q = Math.floor(x / divisor);
                        x -= q * divisor;
                        if (quotient.length > 0 || q > 0)
                            quotient[quotient.length] = q;
                    }
                    remainders[j] = x;
                    dividend = quotient;
                }
                var output = '';
                for (i = remainders.length - 1; i >= 0; i--)
                    output += encoding.charAt(remainders[i]);
                return output;
            }

            function str2rstr_utf8(input) {
                var output = '';
                var i = -1;
                var x, y;
                while (++i < input.length) {
                    x = input.charCodeAt(i);
                    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
                    if (55296 <= x && x <= 56319 && 56320 <= y && y <= 57343) {
                        x = 65536 + ((x & 1023) << 10) + (y & 1023);
                        i++;
                    }
                    if (x <= 127)
                        output += String.fromCharCode(x);
                    else if (x <= 2047)
                        output += String.fromCharCode(192 | x >>> 6 & 31, 128 | x & 63);
                    else if (x <= 65535)
                        output += String.fromCharCode(224 | x >>> 12 & 15, 128 | x >>> 6 & 63, 128 | x & 63);
                    else if (x <= 2097151)
                        output += String.fromCharCode(240 | x >>> 18 & 7, 128 | x >>> 12 & 63, 128 | x >>> 6 & 63, 128 | x & 63);
                }
                return output;
            }

            function str2rstr_utf16le(input) {
                var output = '';
                for (var i = 0; i < input.length; i++)
                    output += String.fromCharCode(input.charCodeAt(i) & 255, input.charCodeAt(i) >>> 8 & 255);
                return output;
            }

            function str2rstr_utf16be(input) {
                var output = '';
                for (var i = 0; i < input.length; i++)
                    output += String.fromCharCode(input.charCodeAt(i) >>> 8 & 255, input.charCodeAt(i) & 255);
                return output;
            }

            function rstr2binl(input) {
                var output = Array(input.length >> 2);
                for (var i = 0; i < output.length; i++)
                    output[i] = 0;
                for (var i = 0; i < input.length * 8; i += 8)
                    output[i >> 5] |= (input.charCodeAt(i / 8) & 255) << i % 32;
                return output;
            }

            function binl2rstr(input) {
                var output = '';
                for (var i = 0; i < input.length * 32; i += 8)
                    output += String.fromCharCode(input[i >> 5] >>> i % 32 & 255);
                return output;
            }

            function binl_md5(x, len) {
                x[len >> 5] |= 128 << len % 32;
                x[(len + 64 >>> 9 << 4) + 14] = len;
                var a = 1732584193;
                var b = -271733879;
                var c = -1732584194;
                var d = 271733878;
                for (var i = 0; i < x.length; i += 16) {
                    var olda = a;
                    var oldb = b;
                    var oldc = c;
                    var oldd = d;
                    a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
                    d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
                    c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
                    b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
                    a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
                    d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
                    c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
                    b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
                    a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
                    d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
                    c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                    b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                    a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
                    d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                    c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                    b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
                    a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
                    d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
                    c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
                    b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
                    a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
                    d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
                    c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                    b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
                    a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
                    d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
                    c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
                    b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
                    a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
                    d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
                    c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
                    b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
                    a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
                    d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
                    c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
                    b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                    a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
                    d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
                    c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
                    b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                    a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
                    d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
                    c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
                    b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
                    a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
                    d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                    c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
                    b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
                    a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
                    d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
                    c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                    b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
                    a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
                    d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
                    c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                    b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
                    a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
                    d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                    c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
                    b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
                    a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
                    d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                    c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
                    b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
                    a = safe_add(a, olda);
                    b = safe_add(b, oldb);
                    c = safe_add(c, oldc);
                    d = safe_add(d, oldd);
                }
                return Array(a, b, c, d);
            }

            function md5_cmn(q, a, b, x, s, t) {
                return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
            }

            function md5_ff(a, b, c, d, x, s, t) {
                return md5_cmn(b & c | ~b & d, a, b, x, s, t);
            }

            function md5_gg(a, b, c, d, x, s, t) {
                return md5_cmn(b & d | c & ~d, a, b, x, s, t);
            }

            function md5_hh(a, b, c, d, x, s, t) {
                return md5_cmn(b ^ c ^ d, a, b, x, s, t);
            }

            function md5_ii(a, b, c, d, x, s, t) {
                return md5_cmn(c ^ (b | ~d), a, b, x, s, t);
            }

            function safe_add(x, y) {
                var lsw = (x & 65535) + (y & 65535);
                var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return msw << 16 | lsw & 65535;
            }

            function bit_rol(num, cnt) {
                return num << cnt | num >>> 32 - cnt;
            }
            return rstr_md5;
        }();
        var Efte = {
            send_message: function(method, args, callback) {
                console.log(method, args, callback);
            },
            ga: function(category, action, label, value, extra) {
                DPApp.send_message('ga', {
                    category: category,
                    action: action,
                    label: label || '',
                    value: value || 0,
                    extra: extra || {}
                }, function() {});
            },
            ajax: function(opts) {
                var options = extend({}, opts);
                var data = opts.data;
                var url = encodeURIComponent(opts.url + '?' + toQueryString(data));
                delete options.modelName;
                options.url = '/proxy?url=' + url;
                var modelName = opts.modelName;
                if (modelName) {
                    options.headers = options.headers || {};
                    options.headers['pragma-modelname'] = modelName;
                }
                options.error = options.error || options.fail;
                var xhr = $ajax(options);
            },
            action: {
                get: function(params, callback) {
                    var objs = [];
                    if (typeof callback != 'function')
                        return;
                    if (Object.prototype.toString.call(params) == '[object Array]') {
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
                },
                open: function(url, params) {}
            },
            getEnv: function(callback) {
                var env = {};
                window.AppEnv = window.AppEnv || {
                    parseQuery: function() {
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
                setTimeout(callback, 0);
            },
            startRefresh: function() {},
            stopRefresh: function() {},
            genUUID: function(dpid) {
                dpid = dpid || window.AppEnv && window.AppEnv.dpid || 0;
                var requid = md5(dpid + new Date().getTime() + Math.random());
                return requid.toString();
            },
            setTitle: function(title) {
                document.getElementsByTagName('title').innerHTML = title;
            },
            takePhoto: function(callback) {}
        };

        function toQueryString(data) {
            var paramObjects = [],
                params = [];
            for (var key in data) {
                if (data.hasOwnProperty(key))
                    paramObjects = paramObjects.concat(object2Query(key, data[key], true));
            }
            for (var i = 0, len = paramObjects.length; i < len; i++) {
                var param = paramObjects[i];
                var value = param.value;
                if (isEmptyObject(value)) {
                    value = '';
                } else if (Object.prototype.toString.call(value) == '[object Date]') {
                    value = value.toString();
                }
                params.push(encodeURIComponent(param.name) + '=' + encodeURIComponent(String(value)));
            }
            return params.join('&');
        }

        function object2Query(name, value, recursive) {
            var objects = [];
            if (isObject(value) || Object.prototype.toString.call(value) == '[object Array]') {
                for (var i in value) {
                    if (recursive) {
                        objects = objects.concat(object2Query(name + '[' + i + ']', value[i], true));
                    } else {
                        objects.push({
                            name: name,
                            value: value[i]
                        });
                    }
                }
            } else {
                objects.push({
                    name: name,
                    value: value
                });
            }
            return objects;
        }

        function isEmptyObject(obj) {
            for (var p in obj) {
                return false;
            }
            return true;
        }

        function isObject(arg) {
            return typeof arg === 'object' && arg !== null;
        }

        function extend(obj, source) {
            if (!source)
                return obj;
            for (var prop in source) {
                obj[prop] = source[prop];
            }
            return obj;
        };
        window.AppEnv = {
            query: {}
        };
        modules[4] = Efte;
    }());
}(modules[4].exports));
(function(exports) {}(modules[3].exports));
(function(exports) {
    (function() {
        var callbacksCount = 1;
        var callbacks = {};
        var isArray = Array.isArray || function(obj) {
                return obj instanceof Array;
            };
        var extend = function(obj, source) {
            if (!source)
                return obj;
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
                var hasCallback = callback && typeof callback == 'function';
                var callbackId = hasCallback ? callbacksCount++ : 0;
                if (hasCallback)
                    callbacks[callbackId] = callback;
                args['callbackId'] = callbackId;
                args = typeof args === 'object' ? JSON.stringify(args) : args + '';
                var ifr = document.createElement('iframe');
                ifr.style.display = 'none';
                document.body.appendChild(ifr);
                ifr.contentWindow.location.href = 'js://_?method=' + method + '&args=' + encodeURIComponent(args) + '&callbackId=' + callbackId;
                setTimeout(function() {
                    ifr.parentNode.removeChild(ifr);
                }, 0);
                return callbackId;
            },
            callback: function(callbackId, retValue) {
                try {
                    var callback = callbacks[callbackId];
                    if (!callback)
                        return;
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
                    url += url.indexOf('?') == -1 ? '?' : '&';
                    url += params.join('&');
                }
                opts.url = url;
                var callbackID = this.send_message('ajax', opts, function(json) {
                    var errMsg = '';
                    if (json.code == 0) {
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
                        if (typeof callback != 'function')
                            return;
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
                open: function(url, params) {
                    var ps = [];
                    for (var k in params) {
                        var v = params;
                        if (typeof v != 'object') {
                            ps.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
                        }
                    }
                    url = url + (url.indexOf('?') != -1 ? '&' : '?') + ps.join('&');
                    this.send_message('openURLAction', {
                        url: url,
                        params: params
                    }, function() {});
                }
            },
            getEnv: function(callback) {
                this.send_message('getEnv', {}, function(env) {
                    window.AppEnv = window.AppEnv || {
                        parseQuery: function() {
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
            startRefresh: function() {},
            stopRefresh: function() {
                this.send_message('stopRefresh', {}, function() {});
            },
            genUUID: function(id) {
                id = id || AppEnv.dpid;
                var requid = CryptoJS.MD5(id + new Date().getTime() + Math.random());
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
    }());
}(modules[2].exports));
(function(exports) {
    'use strict';
    var Efte = {};
    var ioswebview, androidwebview;
    (function() {
        var standalone = window.navigator.standalone,
            userAgent = window.navigator.userAgent.toLowerCase(),
            safari = /safari/.test(userAgent),
            android = /android/.test(userAgent),
            ios = /iphone|ipod|ipad/.test(userAgent);
        if (ios) {
            if (!standalone && !safari) {
                return ioswebview = true;
            }
        }
        if (android) {}
    }());
    if (ioswebview) {
        Efte = modules[2];
    } else if (androidwebview) {
        Efte = modules[3];
    } else {
        Efte = modules[4];
    }
    if (typeof module != 'undefined') {
        main = Efte;
    }
    if (typeof window !== 'undefined') {}
}(main));

window.Efte = main;