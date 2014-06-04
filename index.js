'use strict';

var Efte = {};


// detect webview
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
    // if (!standalone && safari) {
    //   return browser = true;
    // } else if (standalone && !safari) {
    //   return browser = true;
  }

  if (android) {
    // handle android and web
  }


})();

if (ioswebview) {
  Efte = require('./lib/ios');
} else if (androidwebview) {
  Efte = require('./lib/android');
} else { // default go web.js
  Efte = require('./lib/web');
}


if (typeof module != 'undefined') {
  module.exports = Efte;
}

if (typeof window !== 'undefined') {
  // DECISION: export to window or not
  // window.Efte = module.exports;
}