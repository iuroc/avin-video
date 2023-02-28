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
