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
changeActiveMenu();
window.addEventListener('hashchange', function (event) {
    changeActiveMenu();
});
request('/login/api/login', {
    channel_id: 3000,
    device_id: 'apee'
}, function (data) {
    config.user_info = data.data;
}, false);
poncon.setPage('home', function (dom, args, pageData) {
    var _a, _b;
    var ele_type_list = dom === null || dom === void 0 ? void 0 : dom.querySelector('.type-list');
    ele_type_list.innerHTML = (function () {
        var html = '';
        pageData.types.forEach(function (type) {
            html += "<a class=\"btn btn-outline-secondary\" data-type-id=\"".concat(type.type_id, "\" href=\"#/home/").concat(type.type_id, "\">").concat(type.name, "</a>");
        });
        return html;
    })();
    var now_type_id = args[0] || '';
    var eles = ele_type_list === null || ele_type_list === void 0 ? void 0 : ele_type_list.querySelectorAll('[data-type-id]');
    eles.forEach(function (ele) {
        ele.classList.remove('btn-secondary');
        ele.classList.add('btn-outline-secondary');
    });
    var now_ele = ele_type_list === null || ele_type_list === void 0 ? void 0 : ele_type_list.querySelector("[data-type-id=\"".concat(now_type_id, "\"]"));
    (_a = now_ele === null || now_ele === void 0 ? void 0 : now_ele.classList) === null || _a === void 0 ? void 0 : _a.remove('btn-outline-secondary');
    (_b = now_ele === null || now_ele === void 0 ? void 0 : now_ele.classList) === null || _b === void 0 ? void 0 : _b.add('btn-secondary');
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
        var list = data.data.list;
        var html = (function (list) {
            var html = '';
            list.forEach(function (item) {
                html += "";
            });
        })(list);
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
    /** 判断请求是否完成 */
    function response() {
        if (xhr.status == 200 && xhr.readyState == 4) {
            success(JSON.parse(xhr.responseText));
        }
    }
    if (!async)
        return response();
    xhr.onreadystatechange = function () {
        response();
    };
}
/** 修改导航栏激活状态 */
function changeActiveMenu() {
    var target = location.hash.split('/')[1] || 'home';
    var eles = document.querySelectorAll('.sidebar .menu .item');
    eles.forEach(function (ele) {
        ele.classList.remove('active');
    });
    var activeEle = document.querySelector(".sidebar .menu .item-".concat(target));
    activeEle === null || activeEle === void 0 ? void 0 : activeEle.classList.add('active');
}
