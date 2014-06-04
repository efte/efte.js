'use strict';

var efte = require('../index');

// To know the usage of `assert`, see: http://nodejs.org/api/assert.html
var assert = require('assert');

describe("efte", function(){
  it("efte environment detect`", function(){
    efte.send_message('method', [0, 'a'], function() {});
  });
});
