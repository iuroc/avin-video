"use strict";
exports.__esModule = true;
var ponconjs_1 = require("ponconjs");
var querystring = require("querystring");
require("hls.js");
/** 配置信息 */
var config = {
    api: 'https://b532b01e67674081ae52faf978e192e1.apig.cn-south-1.huaweicloudapis.com',
    siteName: 'AVIN 视频',
    canPlay: false
};
/** 缓存数据 */
var dataCache = {};
var poncon = new ponconjs_1["default"]();
poncon.setPageList(['home', 'video', 'about', 'female', 'type', 'play']);
poncon.pages.home.data.types = [
    { typeId: '', name: '全部' },
    { typeId: '1043', name: '国产自拍' },
    { typeId: '1901', name: '亚洲有码' },
    { typeId: '1042', name: '亚洲无码' },
    { typeId: '1029', name: '成人动漫' },
    { typeId: '1045', name: '欧美情色' },
    { typeId: '1912', name: '国产 AV' },
    { typeId: '1891', name: '经典三级' },
];
changeActiveMenu();
window.addEventListener('hashchange', function (event) {
    changeActiveMenu();
});
window.addEventListener('click', function () {
    config.canPlay = true;
});
request('/login/api/login', {
    channel_id: 3000,
    device_id: 'apee'
}, function (data) {
    config.userInfo = data.data;
}, false);
poncon.setPage('home', function (dom, args, pageData) {
    var _a, _b;
    var eleTypeList = dom === null || dom === void 0 ? void 0 : dom.querySelector('.type-list');
    if (!pageData.load) {
        eleTypeList.innerHTML = (function () {
            var html = '<div class="d-inline-block head-type"></div>';
            pageData.types.forEach(function (type) {
                html += "<a class=\"btn btn-outline-secondary\" data-type-id=\"".concat(type.typeId, "\" href=\"#/home/").concat(type.typeId, "\">").concat(type.name, "</a>");
            });
            return html;
        })();
    }
    var eles = eleTypeList === null || eleTypeList === void 0 ? void 0 : eleTypeList.querySelectorAll('[data-type-id]');
    eles.forEach(function (ele) {
        ele.classList.remove('btn-secondary');
        ele.classList.add('btn-outline-secondary');
    });
    eleTypeList.addEventListener('wheel', function (event) {
        event.preventDefault();
        animateScrollLeft(this, this.scrollLeft + 200 * (event.deltaY > 0 ? 1 : -1), 600);
    });
    var nowTypeId = args[0] || '';
    var argsTypeName = args[1] || '';
    var nowEle = eleTypeList === null || eleTypeList === void 0 ? void 0 : eleTypeList.querySelector("[data-type-id=\"".concat(nowTypeId, "\"]"));
    /** 开头的分类选项卡，用于放置非主页原有分类标签 */
    var headTypeEle = eleTypeList.querySelector('.head-type');
    if (argsTypeName) {
        document.title = decodeURIComponent(argsTypeName) + ' - ' + config.siteName;
        if (headTypeEle)
            headTypeEle.innerHTML = "<a class=\"btn btn-secondary\" data-type-id=\"".concat(nowTypeId, "\" href=\"#/home/").concat(nowTypeId, "\">").concat(decodeURIComponent(argsTypeName), "</a>");
    }
    else {
        document.title = (nowEle === null || nowEle === void 0 ? void 0 : nowEle.innerText) + ' - ' + config.siteName;
    }
    (_a = nowEle === null || nowEle === void 0 ? void 0 : nowEle.classList) === null || _a === void 0 ? void 0 : _a.remove('btn-outline-secondary');
    (_b = nowEle === null || nowEle === void 0 ? void 0 : nowEle.classList) === null || _b === void 0 ? void 0 : _b.add('btn-secondary');
    pageData.load = true;
    loadVideoList(nowTypeId, 0, 24);
});
poncon.setPage('play', function (dom, args, pageData) {
    if (pageData.load) {
        return;
    }
    var hls = new Hls();
    var videoId = args[0];
    var videoEle = dom === null || dom === void 0 ? void 0 : dom.querySelector('video');
    videoEle.src = '';
    var postData = {
        uid: config.userInfo.user_id,
        session: config.userInfo.session,
        video_id: videoId
    };
    var dataCacheName = JSON.stringify({
        path: '/video/view/info',
        postData: postData
    });
    if (dataCache[dataCacheName]) {
        runData(dataCache[dataCacheName]);
    }
    else {
        request('/video/view/info', postData, function (data) {
            dataCache[dataCacheName] = data;
            runData(data);
        });
    }
    function runData(data) {
        pageData.load = true;
        var videoUrl = data.data.video.href;
        var videoTitle = data.data.video.name;
        var videoTitleEle = dom === null || dom === void 0 ? void 0 : dom.querySelector('.videoTitle');
        videoTitleEle.innerHTML = videoTitle;
        if (Hls.isSupported()) {
            hls.loadSource(videoUrl);
            hls.attachMedia(videoEle);
        }
        else if (videoEle === null || videoEle === void 0 ? void 0 : videoEle.canPlayType('application/vnd.apple.mpegurl')) {
            videoEle.src = videoUrl;
        }
        if (config.canPlay) {
            videoEle === null || videoEle === void 0 ? void 0 : videoEle.play();
        }
    }
});
poncon.setPage('type', function (dom, args, pageData) {
    var page = parseInt((args && args[0])) || 0;
    loadSubTypeList(page, 24);
});
poncon.start();
/**
 * 加载子类列表
 * @param page 页码 初始值为 0
 * @param pageSize 每页加载数量
 */
function loadSubTypeList(page, pageSize) {
    if (page === void 0) { page = 0; }
    if (pageSize === void 0) { pageSize = 24; }
    var postData = {
        uid: config.userInfo.user_id,
        session: config.userInfo.session,
        page: page + 1,
        page_size: pageSize
    };
    var dataCacheName = JSON.stringify({
        path: '/video/label/type_list',
        postData: postData
    });
    if (dataCache[dataCacheName]) {
        runData(dataCache[dataCacheName]);
    }
    else {
        request('/video/label/type_list', postData, function (data) {
            dataCache[dataCacheName] = data;
            runData(data);
        });
    }
    function runData(data) {
        var listEle = document.querySelector('.poncon-type .sub-type-list');
        var dataList = data.data;
        listEle.innerHTML = (function (dataList) {
            var html = '';
            dataList.forEach(function (item) {
                html += "\n                <div class=\"col-xl-3 col-lg-4 col-sm-6 mb-4\">\n                    <a class=\"card hover-shadow card-body text-center ls-1\" data-type-id=\"".concat(item.id, "\" href=\"#/home/").concat(item.id, "/").concat(item.name, "\">\n                        <div class=\"h5 single-line\">").concat(item.name, "</div>\n                        <div class=\"text-primary\">\u5171 ").concat(item.video_num, " \u4E2A\u89C6\u9891</div>\n                    </a>\n                </div>");
            });
            return html;
        })(dataList);
    }
}
/**
 * 加载视频列表
 * @param typeId 分类 ID
 * @param page 页码 初始值为 0
 * @param pageSize 每页加载数量
 */
function loadVideoList(typeId, page, pageSize, keyword) {
    if (page === void 0) { page = 0; }
    if (pageSize === void 0) { pageSize = 24; }
    if (keyword === void 0) { keyword = ''; }
    var listEle = document.querySelector('.poncon-home .video-list');
    listEle.innerHTML = '';
    var postData = {
        uid: config.userInfo.user_id,
        session: config.userInfo.session,
        is_review: 0,
        is_new: 1,
        v: 0,
        search: keyword,
        label_id: typeId,
        page: page + 1,
        page_size: pageSize
    };
    /** 数据缓存键 */
    var dataCacheName = JSON.stringify({
        path: '/video/view/list',
        postData: postData
    });
    if (dataCache[dataCacheName]) {
        // 使用缓存数据
        runData(dataCache[dataCacheName]);
    }
    else {
        // 重新请求数据
        request('/video/view/list', postData, function (data) {
            runData(data);
        });
    }
    /** 数据获取成功后操作 */
    function runData(data) {
        dataCache[dataCacheName] = data; // 缓存数据
        var list = data.data.list;
        var html = (function (list) {
            var html = '';
            list.forEach(function (item) {
                if (!item.href)
                    return;
                html += "\n                <div class=\"col-xxl-3 col-xl-3 col-lg-4 col-sm-6 mb-4\">\n                    <a class=\"card hover-shadow h-100\" href=\"#/play/".concat(item.id, "\">\n                        <div class=\"ratio ratio-16x9\">\n                            <div class=\"img-box overflow-hidden\">\n                                <img src=\"").concat(changeToHttp(item.href_image), "\" alt=\"").concat(item.name, "\" class=\"card-img-top\">\n                            </div>\n                        </div>\n                        <div class=\"card-body d-flex flex-column ls-1\">\n                            <div class=\"h5 card-title multi-line videoTitle\">").concat(item.name, "</div>\n                            <div class=\"card-text small text-muted d-flex mb-2 mt-auto\">\n                                <span class=\"me-auto\"><span class=\"text-success\">").concat(parseDuration(item.duration), "</span></span>\n                                <span>").concat(item.performer, "</span>\n                            </div>\n                            <div class=\"publish-time small text-muted\">").concat(item.update_time, "</div>\n                        </div>\n                    </a>\n                </div>");
            });
            return html;
        })(list);
        listEle.innerHTML = html;
        listEle.querySelectorAll('.card').forEach(function (ele) {
            ele.addEventListener('click', function () {
                poncon.pages.play.data.load = false;
            });
        });
    }
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
/** 将秒数转换为文本 */
function parseDuration(duration) {
    var hour = Math.floor(duration / 3600);
    var min = Math.floor((duration - hour * 3600) / 60);
    var sec = duration - hour * 3600 - min * 60;
    var str = '';
    str += hour > 0 ? "".concat(hour, "\u65F6") : '';
    str += min > 0 ? "".concat(min, "\u5206") : '';
    str += sec > 0 ? "".concat(sec, "\u79D2") : '';
    return str;
}
/** 将 URL 的协议改成 HTTP */
function changeToHttp(url) {
    return url.replace(/^https?:/, 'http:');
}
/** 水平滚动条 */
function animateScrollLeft(element, to, duration) {
    var start = element.scrollLeft;
    var change = to - start;
    var currentTime = 0;
    var increment = 20;
    function animate() {
        currentTime += increment;
        var val = easeInOutQuad(currentTime, start, change, duration);
        element.scrollLeft = val;
        if (currentTime < duration) {
            requestAnimationFrame(animate);
        }
    }
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1)
            return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    animate();
}
