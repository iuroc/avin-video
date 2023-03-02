import Poncon from 'ponconjs'
import * as querystring from 'querystring'
import 'hls.js'
declare const Hls: any
/** 配置信息 */
const config: {
    /** 后端请求接口地址 */
    api: string,
    /** 身份信息 */
    userInfo?: any,
    /** 站点名称 */
    siteName: string,
    /** 用户是否已经和页面交互，该值可判断是否自动播放视频 */
    canPlay: boolean
} = {
    api: 'https://b532b01e67674081ae52faf978e192e1.apig.cn-south-1.huaweicloudapis.com',
    siteName: 'AVIN 视频',
    canPlay: false
}
/** 缓存数据 */
const dataCache: {
    [key: string]: any
} = {}

const poncon = new Poncon()
poncon.setPageList(['home', 'video', 'about', 'female', 'type', 'play'])
poncon.pages.home.data.types = [
    { typeId: '', name: '全部' },
    { typeId: '1043', name: '国产自拍' },
    { typeId: '1901', name: '亚洲有码' },
    { typeId: '1042', name: '亚洲无码' },
    { typeId: '1029', name: '成人动漫' },
    { typeId: '1045', name: '欧美情色' },
    { typeId: '1912', name: '国产 AV' },
    { typeId: '1891', name: '经典三级' },
]

changeActiveMenu()
window.addEventListener('hashchange', (event) => {
    changeActiveMenu()
})

window.addEventListener('click', () => {
    config.canPlay = true
})

request('/login/api/login', {
    channel_id: 3000,
    device_id: 'apee'
}, (data) => {
    config.userInfo = data.data
}, false)




poncon.setPage('home', (dom, args, pageData) => {
    const eleTypeList = dom?.querySelector('.type-list') as HTMLElement
    if (!pageData.load) {
        eleTypeList.innerHTML = ((): string => {
            let html = '<div class="d-inline-block head-type"></div>'
            pageData.types.forEach((type: { typeId: number | null, name: string }) => {
                html += `<a class="btn btn-outline-secondary" data-type-id="${type.typeId}" href="#/home/${type.typeId}">${type.name}</a>`
            })
            return html
        })()
    }

    const eles = eleTypeList?.querySelectorAll<HTMLElement>('[data-type-id]')
    eles.forEach(ele => {
        ele.classList.remove('btn-secondary')
        ele.classList.add('btn-outline-secondary')
    })
    eleTypeList.addEventListener('wheel', function (event) {
        event.preventDefault()
        animateScrollLeft(this, this.scrollLeft + 200 * (event.deltaY > 0 ? 1 : -1), 600)
    })
    const nowTypeId = (args as string[])[0] || ''
    const argsTypeName = (args as string[])[1] || ''
    const nowEle = eleTypeList?.querySelector(`[data-type-id="${nowTypeId}"]`) as HTMLDivElement
    /** 开头的分类选项卡，用于放置非主页原有分类标签 */
    const headTypeEle = eleTypeList.querySelector('.head-type')
    if (argsTypeName) {
        document.title = decodeURIComponent(argsTypeName) + ' - ' + config.siteName
        if (headTypeEle) headTypeEle.innerHTML = `<a class="btn btn-secondary" data-type-id="${nowTypeId}" href="#/home/${nowTypeId}">${decodeURIComponent(argsTypeName)}</a>`
    } else {
        document.title = nowEle?.innerText + ' - ' + config.siteName
    }
    nowEle?.classList?.remove('btn-outline-secondary')
    nowEle?.classList?.add('btn-secondary')
    pageData.load = true
    loadVideoList(nowTypeId, 0, 24)
})
poncon.setPage('play', (dom, args, pageData) => {
    if (pageData.load) {
        return
    }
    const hls = new Hls()
    const videoId = (args as string[])[0]
    const videoEle = dom?.querySelector('video') as HTMLVideoElement
    videoEle.src = ''
    const postData = {
        uid: config.userInfo.user_id,
        session: config.userInfo.session,
        video_id: videoId
    }
    const dataCacheName = JSON.stringify({
        path: '/video/view/info',
        postData: postData
    })
    if (dataCache[dataCacheName]) {
        runData(dataCache[dataCacheName])
    } else {
        request('/video/view/info', postData, (data) => {
            dataCache[dataCacheName] = data
            runData(data)
        })
    }
    function runData(data: any) {
        pageData.load = true
        const videoUrl: string = data.data.video.href
        const videoTitle: string = data.data.video.name
        const videoTitleEle = dom?.querySelector('.videoTitle') as HTMLDivElement
        videoTitleEle.innerHTML = videoTitle
        if (Hls.isSupported()) {
            hls.loadSource(videoUrl)
            hls.attachMedia(videoEle)
        } else if (videoEle?.canPlayType('application/vnd.apple.mpegurl')) {
            videoEle.src = videoUrl;
        }
        if (config.canPlay) {
            videoEle?.play()
        }
    }
})

poncon.setPage('type', (dom, args, pageData) => {
    const page = parseInt((args && args[0]) as string) || 0
    loadSubTypeList(page, 24)
})
poncon.start()


/**
 * 加载子类列表
 * @param page 页码 初始值为 0
 * @param pageSize 每页加载数量
 */
function loadSubTypeList(page: number = 0, pageSize: number = 24) {
    const postData = {
        uid: config.userInfo.user_id,
        session: config.userInfo.session,
        page: page + 1,
        page_size: pageSize
    }
    const dataCacheName = JSON.stringify({
        path: '/video/label/type_list',
        postData: postData
    })
    if (dataCache[dataCacheName]) {
        runData(dataCache[dataCacheName])
    } else {
        request('/video/label/type_list', postData, (data) => {
            dataCache[dataCacheName] = data
            runData(data)
        })
    }

    function runData(data: any) {
        const listEle = document.querySelector('.poncon-type .sub-type-list') as HTMLElement
        const dataList = data.data
        listEle.innerHTML = ((dataList) => {
            let html = ''
            dataList.forEach((item: {
                /** 子类 ID */
                id: number,
                /** 子类名称 */
                name: string,
                /** 子类视频数量 */
                video_num: number
            }) => {
                html += `
                <div class="col-xl-3 col-lg-4 col-sm-6 mb-4">
                    <a class="card hover-shadow card-body text-center ls-1" data-type-id="${item.id}" href="#/home/${item.id}/${item.name}">
                        <div class="h5 single-line">${item.name}</div>
                        <div class="text-primary">共 ${item.video_num} 个视频</div>
                    </a>
                </div>`
            })
            return html
        })(dataList)
    }
}
/**
 * 加载视频列表
 * @param typeId 分类 ID
 * @param page 页码 初始值为 0
 * @param pageSize 每页加载数量
 */
function loadVideoList(typeId: string, page: number = 0, pageSize: number = 24, keyword: string = '') {
    const listEle = document.querySelector('.poncon-home .video-list') as HTMLElement
    listEle.innerHTML = ''
    const postData = {
        uid: config.userInfo.user_id,
        session: config.userInfo.session,
        is_review: 0,
        is_new: 1,
        v: 0,
        search: keyword,
        label_id: typeId,
        page: page + 1,
        page_size: pageSize,
    }
    /** 数据缓存键 */
    const dataCacheName = JSON.stringify({
        path: '/video/view/list',
        postData: postData
    })
    if (dataCache[dataCacheName]) {
        // 使用缓存数据
        runData(dataCache[dataCacheName])
    } else {
        // 重新请求数据
        request('/video/view/list', postData, (data) => {
            runData(data)
        })
    }
    /** 数据获取成功后操作 */
    function runData(data: any) {
        dataCache[dataCacheName] = data // 缓存数据
        const list = data.data.list as any[]
        const html = ((list) => {
            let html = ''
            list.forEach((item: {
                /** 封片图片 */
                href_image: string,
                /** 视频标题 */
                name: string,
                /** 时长 */
                duration: number,
                /** 类型 */
                performer: string,
                /** 发布时间 */
                update_time: string,
                /** 视频文件地址 */
                href: string,
                /** 视频 ID */
                id: number
            }) => {
                if (!item.href) return
                html += `
                <div class="col-xxl-3 col-xl-3 col-lg-4 col-sm-6 mb-4">
                    <a class="card hover-shadow h-100" href="#/play/${item.id}">
                        <div class="ratio ratio-16x9">
                            <div class="img-box overflow-hidden">
                                <img src="${changeToHttp(item.href_image)}" alt="${item.name}" class="card-img-top">
                            </div>
                        </div>
                        <div class="card-body d-flex flex-column ls-1">
                            <div class="h5 card-title multi-line videoTitle">${item.name}</div>
                            <div class="card-text small text-muted d-flex mb-2 mt-auto">
                                <span class="me-auto"><span class="text-success">${parseDuration(item.duration)}</span></span>
                                <span>${item.performer}</span>
                            </div>
                            <div class="publish-time small text-muted">${item.update_time}</div>
                        </div>
                    </a>
                </div>`
            })
            return html
        })(list)
        listEle.innerHTML = html
        listEle.querySelectorAll<HTMLElement>('.card').forEach(ele => {
            ele.addEventListener('click', () => {
                poncon.pages.play.data.load = false
            })
        })
    }
}

/**
 * 发送 POST 请求
 * @param path 接口路径
 * @param data 请求数据
 * @param success 回调函数
 * @param async 是否异步
 */
function request(
    path: string,
    data: any,
    success: (
        /** 响应数据 */
        data: any
    ) => void,
    async: boolean = true
) {
    const xhr = new XMLHttpRequest()
    const content = querystring.stringify(data)
    xhr.open('POST', config.api + path, async)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(content)
    /** 判断请求是否完成 */
    function response() {
        if (xhr.status == 200 && xhr.readyState == 4) {
            success(JSON.parse(xhr.responseText))
        }
    }
    if (!async) return response()
    xhr.onreadystatechange = () => {
        response()
    }
}


/** 修改导航栏激活状态 */
function changeActiveMenu() {
    const target = location.hash.split('/')[1] || 'home'
    const eles = document.querySelectorAll<HTMLElement>('.sidebar .menu .item')
    eles.forEach(ele => {
        ele.classList.remove('active')
    })
    const activeEle = document.querySelector(`.sidebar .menu .item-${target}`)
    activeEle?.classList.add('active')
}

/** 将秒数转换为文本 */
function parseDuration(duration: number) {
    const hour = Math.floor(duration / 3600)
    const min = Math.floor((duration - hour * 3600) / 60)
    const sec = duration - hour * 3600 - min * 60
    let str = ''
    str += hour > 0 ? `${hour}时` : ''
    str += min > 0 ? `${min}分` : ''
    str += sec > 0 ? `${sec}秒` : ''
    return str
}



/** 将 URL 的协议改成 HTTP */
function changeToHttp(url: string) {
    return url.replace(/^https?:/, 'http:')
}

/** 水平滚动条 */
function animateScrollLeft(element: HTMLElement, to: number, duration: number) {
    const start = element.scrollLeft
    const change = to - start
    let currentTime = 0
    const increment = 20

    function animate() {
        currentTime += increment
        var val = easeInOutQuad(currentTime, start, change, duration)
        element.scrollLeft = val
        if (currentTime < duration) {
            requestAnimationFrame(animate)
        }
    }
    function easeInOutQuad(t: number, b: number, c: number, d: number) {
        t /= d / 2
        if (t < 1) return c / 2 * t * t + b
        t--
        return -c / 2 * (t * (t - 2) - 1) + b
    }
    animate()
}