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
Common api for efte

## - send_message

**send_message**  `Efte.send_message(method, args, callback)`
JS call native method with args, and will callback with the native JSON result.

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

## - setTitle

**setTitle** `Efte.setTitle(title)`
Set page title, it will show on header.

- title: `String`

```js
Efte.setTitle('首页');
```

## - action.open

**open** `Efte.action.open(unit, path, query, modal, animate)`
Open a new webview to load `{unit}/{path}?query`.

- unit: `String`, unit name.
- path: `String`, page path. eg: `'src/index'`.
- query: `Object`, query params, default `{}`.
- modal: `Boolean`, open like modal, slide from bottom to top, default `false`.
- animate: `Boolean`, open with animate, default `true`.

```js
Efte.action.open('unit-m-home', 'src/home', { bu: '交易平台' });
```

## - action.back

**back** `Efte.action.back(animate)`
Close current webview.

- animate: `Boolean`, default `true`.

```js
Efte.action.back();
```

## - action.dismiss

**dismiss** `Efte.action.dismiss(animate)`
Close current modal webview.

- animate: `Boolean`, default `true`.

```js
Efte.action.dismiss();
```

## - action.openUrl

**openUrl** `Efte.action.openUrl(url, modal, animate)`
Open a new webview to load url.

- url: `String`
- modal: `Boolean`, open like modal, slide from bottom to top, default `false`.
- animate: `Boolean`, open with animate, default `true`.

```js
Efte.action.openUrl('http://m.dianping.com');
```

## - action.get

**get** `Efte.action.get(callback)`
Get the query params previous page pass

- callback: `Function`, called with params `query`
  query: `Object`, default `{}`

```js
Efte.action.get(function (query) {
  console.log(JSON.stringify(query));
});
```

## - action.reloadPage

**reloadPage** `Efte.action.reloadPage()`
Reload current page.


Plugins
=======
Useful plugins efte.js support currently.

## - setBarButtons

**setBarButtons** `Efte.setBarButtons(buttons)`
Set buttons of top right corner.

- buttons: `Array`, `[button...]`

  button: `Object`

  title: `String`
  action: `Function`, handler for user taped the button.

```js
Efte.setBarButtons([{
  title: '设置',
  action: function () {
    console.log('taped');
  }
}]);
```

## - date

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

## - geo.getCurrentPosition

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

## - takePhoto

**takePhoto** `Efte.takePhoto(callback)`
Pick photo from photo gallary or camera;

- callbck: `Function`, called with `photoInfo`.

  photoInfo: `Object`

  name: `String`, photo name at gallary.

## - showPhoto

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

## - enableRefresh

**enableRefresh** `Efte.enableRefresh()`
Enable pull down refresh. Need be called before use `startRefresh`

## - startRefresh

**startRefresh**
Override this function, it will be called when user pull down the webview.

```js
Efte.startRefresh = function () {
  // refresh data and update DOM

  Efte.stopRefresh();
}
```

## - stopRefresh

**stopRefresh** `Efte.stopRefresh()`
Use to stop refresh at the end of `startRefresh`.

```js
Efte.startRefresh = function () {
  // refresh data and update DOM

  Efte.stopRefresh();
}
```


