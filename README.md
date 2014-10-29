efte.js
=======

The foundation js bridge for efte projects, it provides js bridges that used in webview or browser (when you do local development).

Install
=======

Use cortex CLI tool to install efte.

```bash
$ cortex install efte --save
```

Require `efte` in the js you will use it.

```js
var Efte = require('efte');
```

API Base
========

## - send_message

**send_message**  `Efte.send_message(method, args, callback)`
JS call native method, use args, and will callback with the native JSON result.

- method: `String`, eg: `'ajax'`
- args: `Object`, eg: `{}`
- callback: `Function`

```js
Efte.send_message('ajax', {
  method: 'GET',
  url: 'http://efte.io',
  data: {}
}, function (xhr) {
  console.log(xhr.status);
});
```

## - publish

**publish**  `Efte.publish(name, value)`
Use to pushlish message to other page. Always use with `subscribe`.

- name: `String`, must a uniq string identifier in an App, eg: `'unit-m-customer-add-customer'`
- value: `Object`, JSON object, Android limit size 30KB.

```js
Efte.publish('unit-m-customer-add-customer', {
  customerName: '小肥羊',
  bizType: 1,
  ...
});
```

## - subscribe

**subscribe** `Efte.subscribe(name, callback)`
Use to receive message from `publish`.

- name: `String`, must a uniq string identifier in an App, eg: `'unit-m-customer-add-customer'`
- callback: `Function`, call with received JSON object message.

```js
Efte.subscribe('unit-m-customer-add-customer', function (customer) {
  console.log(JSON.stringify(customer));
});
```


Plugins
=======

## date

**date** `Efte.date(options, callback)`
Useful Datetime Picker.

- options: `Object`, Config for Datetime Picker.

  type: `String`, set Datetime Picker type. eg: `'date | time | datetime(default)'`
  default: `String`, set default show datetime in Datetime Picker. eg: `'2014-11-11 | 12:12:12 | 2014-11-11 12:12:12(default)'`
  minuteInterval: `Integer`, must divide exactly by 60, set the minute step of Datetime Picker.
  minDate: `Integer`, set the min indate, milliseconds start at 1970. eg: `1402012800000`
  maxDate: `Integer`, set the max indate, milliseconds start at 1970. eg: `1414569430214`
- callback: `Function`, called with user picked datetime string

```js
Efte.date({
  type: 'date',
  default: '2014-12-12'
}, function (date) {
  console.log(date);
});
```

## geo.getCurrentPosition

**getCurrentPosition** `Efte.geo.getCurrentPosition(success, error)`
Get current geo coords like `{ lng: 121.4268740794 , lat: 31.2202555095 }`.

- success: `Function`, call when get coords successfully.
- error: `Function`, call when get coords failed.

```js
Efte.geo.getCurrentPosition(function (coords) {
  console.log('经度: ' + coords.lng + ', 纬度: ' + coords.lat);
}, function (errMsg) {
  alert(errMsg);
});
```

## showPhoto

**showPhoto** `Efte.showPhoto(photo, onDelete)`
Show large photo.

- photo: `Object`, photo info.

  url: `String`, full size image url.
  editable: `Boolean`, exactly deletable.
- onDelete: `Function`, delete callback.

```js
Efte.showPhoto({
  url: 'http://efte.io/img/full-size.png',
  editable: true
}, function () {
  // delete in the photos
});
```

