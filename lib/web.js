(function() {

  var $ajax = (function() {
    return ajax;

    function appendQuery(url, query) {
      if (query == '') return url
      return (url + '&' + query).replace(/[&?]{1,2}/, '?')
    }

    function stringifyQuery(obj) {
      return obj ? Object.keys(obj).map(function (key) {
        var val = obj[key];

        if (Array.isArray(val)) {
          return val.map(function (val2) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
          }).join('&');
        }

        return encodeURIComponent(key) + '=' + encodeURIComponent(val);
      }).join('&') : '';
    }


    function serializeData(options) {
      if (options.data && (!options.type || options.type.toUpperCase() == 'GET')) {
        options.url = appendQuery(options.url, stringifyQuery(options.data));
        options.data = undefined;
      }
    }

    function ajax(options) {
      var settings = extend({
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

      if (!settings.url) settings.url = window.location.toString();
      
      serializeData(settings);

      var dataType = settings.dataType,
        ajaxSuccess = settings.success,
        ajaxError = settings.error,
        hasPlaceholder = /\?.+=\?/.test(settings.url);

      var mime = settings.accepts[dataType],
        headers = {},
        setHeader = function(name, value) {
          headers[name.toLowerCase()] = [name, value];
        },
        xhr = new window.XMLHttpRequest(),
        nativeSetHeader = xhr.setRequestHeader;

      setHeader('Accept', mime || '*/*');
      if (mime = settings.mimeType || mime) {
        if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0];
        xhr.overrideMimeType && xhr.overrideMimeType(mime);
      }

      if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
        setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');

      if (settings.headers)
        for (var name in settings.headers) setHeader(name, settings.headers[name]);

      xhr.setRequestHeader = setHeader;

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) { // ready
          xhr.onreadystatechange = function() {};
          var result, error = false;
          if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            result = xhr.responseText;

            try {
              result = /^\s*$/.test(result) ? null : JSON.parse(result);
            } catch (e) {
              error = e;
            }

            if (error) ajaxError && ajaxError(error, 'parsererror', xhr, settings);
            else ajaxSuccess(result, xhr, settings);
          } else {
            ajaxError && ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings);
          }
        }
      };

      xhr.open(settings.type, settings.url, true, settings.username, settings.password);

      // set headers
      for (var name in headers) nativeSetHeader.apply(xhr, headers[name]);

      // avoid sending empty string 
      xhr.send(settings.data ? settings.data : null);
      return xhr;
    }
  })();


  var md5 = (function() {
    /*
     * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
     * Digest Algorithm, as defined in RFC 1321.
     * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
     * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
     * Distributed under the BSD License
     * See http://pajhome.org.uk/crypt/md5 for more info.
     */

    /*
     * Configurable variables. You may need to tweak these to be compatible with
     * the server-side, but the defaults work in most cases.
     */
    var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase        */
    var b64pad = ""; /* base-64 pad character. "=" for strict RFC compliance   */

    /*
     * These are the functions you'll usually want to call
     * They take string arguments and return either hex or base-64 encoded strings
     */

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

    /*
     * Perform a simple self-test to see if the VM is working
     */

    function md5_vm_test() {
      return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
    }

    /*
     * Calculate the MD5 of a raw string
     */

    function rstr_md5(s) {
      return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }

    /*
     * Calculate the HMAC-MD5, of a key and some data (raw strings)
     */

    function rstr_hmac_md5(key, data) {
      var bkey = rstr2binl(key);
      if (bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

      var ipad = Array(16),
        opad = Array(16);
      for (var i = 0; i < 16; i++) {
        ipad[i] = bkey[i] ^ 0x36363636;
        opad[i] = bkey[i] ^ 0x5C5C5C5C;
      }

      var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
      return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }

    /*
     * Convert a raw string to a hex string
     */

    function rstr2hex(input) {
      try {
        hexcase;
      } catch (e) {
        hexcase = 0;
      }
      var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
      var output = "";
      var x;
      for (var i = 0; i < input.length; i++) {
        x = input.charCodeAt(i);
        output += hex_tab.charAt((x >>> 4) & 0x0F) + hex_tab.charAt(x & 0x0F);
      }
      return output;
    }

    /*
     * Convert a raw string to a base-64 string
     */

    function rstr2b64(input) {
      try {
        b64pad;
      } catch (e) {
        b64pad = '';
      }
      var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var output = "";
      var len = input.length;
      for (var i = 0; i < len; i += 3) {
        var triplet = (input.charCodeAt(i) << 16) | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
        for (var j = 0; j < 4; j++) {
          if (i * 8 + j * 6 > input.length * 8) output += b64pad;
          else output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
        }
      }
      return output;
    }

    /*
     * Convert a raw string to an arbitrary string encoding
     */

    function rstr2any(input, encoding) {
      var divisor = encoding.length;
      var i, j, q, x, quotient;

      /* Convert to an array of 16-bit big-endian values, forming the dividend */
      var dividend = Array(Math.ceil(input.length / 2));
      for (i = 0; i < dividend.length; i++) {
        dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
      }

      /*
       * Repeatedly perform a long division. The binary array forms the dividend,
       * the length of the encoding is the divisor. Once computed, the quotient
       * forms the dividend for the next step. All remainders are stored for later
       * use.
       */
      var full_length = Math.ceil(input.length * 8 /
        (Math.log(encoding.length) / Math.log(2)));
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

      /* Convert the remainders to the output string */
      var output = "";
      for (i = remainders.length - 1; i >= 0; i--)
        output += encoding.charAt(remainders[i]);

      return output;
    }

    /*
     * Encode a string as utf-8.
     * For efficiency, this assumes the input is valid utf-16.
     */

    function str2rstr_utf8(input) {
      var output = "";
      var i = -1;
      var x, y;

      while (++i < input.length) {
        /* Decode utf-16 surrogate pairs */
        x = input.charCodeAt(i);
        y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
        if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
          x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
          i++;
        }

        /* Encode output as utf-8 */
        if (x <= 0x7F)
          output += String.fromCharCode(x);
        else if (x <= 0x7FF)
          output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
            0x80 | (x & 0x3F));
        else if (x <= 0xFFFF)
          output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
            0x80 | ((x >>> 6) & 0x3F),
            0x80 | (x & 0x3F));
        else if (x <= 0x1FFFFF)
          output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
            0x80 | ((x >>> 12) & 0x3F),
            0x80 | ((x >>> 6) & 0x3F),
            0x80 | (x & 0x3F));
      }
      return output;
    }

    /*
     * Encode a string as utf-16
     */

    function str2rstr_utf16le(input) {
      var output = "";
      for (var i = 0; i < input.length; i++)
        output += String.fromCharCode(input.charCodeAt(i) & 0xFF, (input.charCodeAt(i) >>> 8) & 0xFF);
      return output;
    }

    function str2rstr_utf16be(input) {
      var output = "";
      for (var i = 0; i < input.length; i++)
        output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
          input.charCodeAt(i) & 0xFF);
      return output;
    }

    /*
     * Convert a raw string to an array of little-endian words
     * Characters >255 have their high-byte silently ignored.
     */

    function rstr2binl(input) {
      var output = Array(input.length >> 2);
      for (var i = 0; i < output.length; i++)
        output[i] = 0;
      for (var i = 0; i < input.length * 8; i += 8)
        output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
      return output;
    }

    /*
     * Convert an array of little-endian words to a string
     */

    function binl2rstr(input) {
      var output = "";
      for (var i = 0; i < input.length * 32; i += 8)
        output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
      return output;
    }

    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length.
     */

    function binl_md5(x, len) {
      /* append padding */
      x[len >> 5] |= 0x80 << ((len) % 32);
      x[(((len + 64) >>> 9) << 4) + 14] = len;

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

    /*
     * These functions implement the four basic operations the algorithm uses.
     */

    function md5_cmn(q, a, b, x, s, t) {
      return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }

    function md5_ff(a, b, c, d, x, s, t) {
      return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function md5_gg(a, b, c, d, x, s, t) {
      return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function md5_hh(a, b, c, d, x, s, t) {
      return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function md5_ii(a, b, c, d, x, s, t) {
      return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */

    function safe_add(x, y) {
      var lsw = (x & 0xFFFF) + (y & 0xFFFF);
      var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left.
     */

    function bit_rol(num, cnt) {
      return (num << cnt) | (num >>> (32 - cnt));
    }
    return rstr_md5;
  })();

  var parseQuery = function(str) {
    if (typeof str !== 'string') {
          return {};
      }

      str = str.trim().replace(/^(\?|#)/, '');

      if (!str) {
          return {};
      }

      return str.trim().split('&').reduce(function (ret, param) {
          var parts = param.replace(/\+/g, ' ').split('=');
          var key = parts[0];
          var val = parts[1];

          key = decodeURIComponent(key);
          // missing `=` should be `null`:
          // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
          val = val === undefined ? null : decodeURIComponent(val);

          if (!ret.hasOwnProperty(key)) {
              ret[key] = val;
          } else if (Array.isArray(ret[key])) {
              ret[key].push(val);
          } else {
              ret[key] = [ret[key], val];
          }

          return ret;
      }, {});
  }


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

      delete options.modelName;

      var modelName = opts.modelName;
      if (modelName) {
        options.headers = options.headers || {};
        options.headers['pragma-modelname'] = modelName;
      }

      options.error = options.error || options.fail;

      var xhr;
      var _success = options.success || options.done;

      options.success = function(json) {
        // web 环境下
        // success code 200
        // error code  !200
        // 
        // data 为 msg | message
        // var data = json.message || json.msg;

        if (json.code != 200) {
          options.error(json.code, json, xhr);
          return;
        }

        _success(json, xhr);
      };

      if (typeof $ != 'undefined' && $.ajax) {
        xhr = $.ajax(options);
      } else {
        xhr = $ajax(options);
      }
    },

    action: {
      get: function(callback) {
        callback(parseQuery(location.search))
      },
      open: function(unit, path, params) {
        var url = location.protocol + '//' + location.host
          + '/neurons/' + unit + '/latest/' + path + '.html' + (params ? ('?' + toQueryString(params)) : '');

        location.href = url;

        console.log('open page in unit: ' + unit + ' with path:' + path, params);
      },
      openUrl: function(url) {
        window.open(url);
      },
      back: function () {
        history.back();
      }
    },

    getEnv: function(callback) {
      var env = {}; // mock env
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

      setTimeout(callback, 0);
    },

    startRefresh: function() {
      // override this method plz
    },
    stopRefresh: function() {
      // override this method plz
    },
    genUUID: function(dpid) {
      dpid = dpid || (window.AppEnv && window.AppEnv.dpid) || 0;

      var requid = md5(dpid + (new Date().getTime()) + (Math.random()));
      return requid.toString();
    },
    setTitle: function(title) {
      document.getElementsByTagName('title').innerHTML = title;
    },
    takePhoto: function(callback) {

    },
    setBarButtons: function() {},

    publish: function() {},

    subscribe: function() {
      return {
        unsubscribe: function() {}
      }
    },

    multilevel: function(options, values, callback) {
      callback(values.map(function(value) {
        return {
          value: value,
          text: value
        }
      }))
    },

    datePicker: function () {}
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

  window.AppEnv = {
    query: {}
  };

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
    if (!source) return obj;

    for (var prop in source) {
      obj[prop] = source[prop];
    }

    return obj;
  }

  module.exports = Efte;
})();
