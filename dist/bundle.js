(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],3:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":1,"./encode":2}],4:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var ponconjs_1 = require("ponconjs");
var querystring = require("querystring");
/** 配置信息 */
var config = {
    api: 'https://ccc5570db0b64bbdaf28c5d861a9886b.apig.cn-south-1.huaweicloudapis.com'
};
var poncon = new ponconjs_1["default"]();
poncon.setPageList(['home', 'video', 'about', 'female', 'type']);
poncon.pages.home.data.types = [
    { type_id: '', name: '全部' },
    { type_id: '1043', name: '国产自拍' },
    { type_id: '1901', name: '亚洲有码' },
    { type_id: '1042', name: '亚洲无码' },
    { type_id: '1029', name: '成人动漫' },
    { type_id: '1045', name: '欧美情色' },
    { type_id: '1912', name: '国产 AV' },
    { type_id: '1891', name: '经典三级' },
];
request('/login/api/login', {
    channel_id: 3000,
    device_id: 'apee'
}, function (data) {
    config.user_info = data.data;
}, false);
poncon.setPage('home', function (dom, args, pageData) {
    var ele_type_list = dom === null || dom === void 0 ? void 0 : dom.querySelector('.type-list');
    ele_type_list.innerHTML = (function () {
        var html = '';
        pageData.types.forEach(function (type) {
            html += "<a class=\"btn btn-outline-secondary\" href=\"#/home/".concat(type.type_id, "\">").concat(type.name, "</a>");
        });
        return html;
    })();
    var now_type_id = args[0] || '';
    loadVideoList(now_type_id, 0, 24);
});
poncon.start();
/**
 * 加载视频列表
 * @param type_id 分类 ID
 * @param page 页码 初始值为 0
 * @param pageSize 每页加载数量
 */
function loadVideoList(type_id, page, pageSize) {
    if (page === void 0) { page = 0; }
    if (pageSize === void 0) { pageSize = 24; }
    request('/video/view/list', {
        uid: config.user_info.user_id,
        session: config.user_info.session,
        is_review: 0,
        is_new: 1,
        v: 0,
        label_id: type_id,
        page: page + 1,
        page_size: pageSize
    }, function (data) {
        console.log(data);
    });
}
/**
 * 发送 POST 请求
 * @param path 接口路径
 * @param data 请求数据
 * @param success 回调函数
 * @param async 是否异步
 */
function request(path, data, success, async) {
    if (async === void 0) { async = true; }
    var xhr = new XMLHttpRequest();
    var content = querystring.stringify(data);
    xhr.open('POST', config.api + path, async);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(content);
    if (!async)
        return success(JSON.parse(xhr.responseText));
    xhr.onreadystatechange = function () {
        if (xhr.status == 200 && xhr.readyState == 4) {
            success(JSON.parse(xhr.responseText));
        }
    };
}

},{"ponconjs":5,"querystring":3}],5:[function(require,module,exports){
"use strict";
exports.__esModule = true;
/**
 * @author 欧阳鹏
 * https://apee.top
 */
var Poncon = /** @class */ (function () {
    function Poncon() {
        this.pages = {};
        this.pageNames = []; // 页面列表
    }
    /**
     * 切换页面显示
     * @param target 页面标识
     */
    Poncon.prototype.changeView = function (target) {
        if (!target) {
            return;
        }
        document.querySelectorAll('.poncon-page').forEach(function (dom) {
            dom.style.display = 'none';
        });
        var dom = document.querySelector(".poncon-".concat(target));
        dom.style.display = '';
    };
    /**
     * 设置页面名称列表
     * @param pageNames 页面名称列表
     */
    Poncon.prototype.setPageList = function (pageNames) {
        var _this_1 = this;
        pageNames.forEach(function (target) {
            var dom = document.querySelector(".poncon-".concat(target));
            _this_1.pages[target] = {
                dom: dom,
                event: (function () { }),
                data: {}
            };
        });
        this.pageNames = pageNames;
    };
    /**
     * 配置页面
     * @param target 页面标识
     * @param func 页面载入事件
     */
    Poncon.prototype.setPage = function (target, func) {
        if (!target) {
            return;
        }
        this.pages[target]['event'] = func || (function () { });
    };
    /**
     * 开启路由系统
     */
    Poncon.prototype.start = function () {
        var _this = this;
        window.addEventListener('hashchange', function (event) {
            var hash = new URL(event.newURL).hash;
            _this.loadTarget(hash);
        });
        this.loadTarget();
    };
    /**
     * 切换页面并执行页面事件
     * @param hash 页面标识
     */
    Poncon.prototype.loadTarget = function (hash) {
        var target = this.getTarget(hash);
        var dom = this.getDom(target);
        var args = this.getArgs(hash);
        this.changeView(target);
        this.pages[target].event(dom, args, this.pages[target].data);
    };
    /**
     * 获取页面参数列表
     * @param hash 网址Hash
     * @returns 页面参数列表
     */
    Poncon.prototype.getArgs = function (hash) {
        var strs = (hash || location.hash).split('/');
        if (strs.length < 3) {
            return [];
        }
        return strs.slice(2);
    };
    /**
     * 获取当前页面标识, 支持自动矫正
     * @param hash 网址hash
     * @returns 页面标识
     */
    Poncon.prototype.getTarget = function (hash) {
        var strs = (hash || location.hash).split('/');
        var target = strs[1] || '';
        // target不合法或者不在白名单
        if (target.search(/^\w+$/) != 0 || this.pageNames.indexOf(target) == -1) {
            history.replaceState({}, '', "".concat(location.pathname));
            return 'home';
        }
        return target;
    };
    /**
     * 获取页面DOM
     * @param target 页面标识
     * @returns 页面DOM元素
     */
    Poncon.prototype.getDom = function (target) {
        return document.querySelector(".poncon-".concat(target));
    };
    return Poncon;
}());
exports["default"] = Poncon;

},{}]},{},[4]);
