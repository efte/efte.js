'use strict';

var Efte;

var userAgent = window.navigator.userAgent.toLowerCase();

if (/efte\b/.test(userAgent)) {
  Efte = require('./lib/ios');

} else { // default go web.js
  Efte = require('./lib/web');
}


if (typeof module !== 'undefined') {
  module.exports = Efte;
}

if (typeof window !== 'undefined') {
  // DECISION: export to window or not
  window.Efte = Efte;
}
