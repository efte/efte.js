//    efte.js 1.1.0

//    (c) 2014 JS part for EFTE framework
//    For all details and documentation:
//    http://eftejs.io

(function (Host) {
  var Efte;

  var userAgent = Host.navigator.userAgent.toLowerCase();

  // Require different platform js base on userAgent.
  // Native part will inject the userAgent with string `efte`.
  if (/efte\b/.test(userAgent)) {
    Efte = require('./lib/ios');

  // Default web.js
  } else {
    Efte = require('./lib/web');
  }

  // Export Efte object, if support AMD, CMD, CommonJS.
  if (typeof module !== 'undefined') {
    module.exports = Efte;
  }

  // Export Efte object to Host
  if (typeof Host !== 'undefined') {
    Host.Efte = Efte;
  }
}(this));

