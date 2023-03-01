import Poncon from 'ponconjs'
import * as querystring from 'querystring'
import 'hls.js'
declare const Hls: any
/** 配置信息 */
const config: {
    /** 后端请求接口地址 */
    api: string,
    /** 身份信息 */
    user_info?: any,
    /** 站点名称 */
    siteName: string,
    /** 用户是否已经和页面交互，该值可判断是否自动播放视频 */
    canPlay: boolean
} = {
    api: 'https://b532b01e67674081ae52faf978e192e1.apig.cn-south-1.huaweicloudapis.com',
    siteName: 'AVIN 视频',
    canPlay: false
}

const poncon = new Poncon()
poncon.setPageList(['home', 'video', 'about', 'female', 'type', 'play'])
poncon.pages.home.data.types = [
    { type_id: '', name: '全部' },
    { type_id: '1043', name: '国产自拍' },
    { type_id: '1901', name: '亚洲有码' },
    { type_id: '1042', name: '亚洲无码' },
    { type_id: '1029', name: '成人动漫' },
    { type_id: '1045', name: '欧美情色' },
    { type_id: '1912', name: '国产 AV' },
    { type_id: '1891', name: '经典三级' },
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
    config.user_info = data.data
}, false)




poncon.setPage('home', (dom, args, pageData) => {
    const ele_type_list = dom?.querySelector('.type-list') as HTMLElement
    if (!pageData.load) {
        ele_type_list.innerHTML = ((): string => {
            let html = ''
            pageData.types.forEach((type: { type_id: number | null, name: string }) => {
                html += `<a class="btn btn-outline-secondary" data-type-id="${type.type_id}" href="#/home/${type.type_id}">${type.name}</a>`
            })
            return html
        })()
    }
    const now_type_id = (args as string[])[0] || ''
    const eles = ele_type_list?.querySelectorAll<HTMLElement>('[data-type-id]')
    eles.forEach(ele => {
        ele.classList.remove('btn-secondary')
        ele.classList.add('btn-outline-secondary')
        if (!pageData.load) {
            ele.addEventListener('click', () => {
                poncon.pages.home.data.load = false
            })
        }
    })
    const now_ele = ele_type_list?.querySelector(`[data-type-id="${now_type_id}"]`) as HTMLDivElement
    now_ele?.classList?.remove('btn-outline-secondary')
    now_ele?.classList?.add('btn-secondary')
    document.title = now_ele?.innerText + ' - ' + config.siteName
    pageData.load = true
    if (!pageData.request) {
        loadVideoList(now_type_id, 0, 24)
    }
})
poncon.setPage('play', (dom, args, pageData) => {
    if (pageData.load) {
        return
    }
    const hls = new Hls()
    const videoId = (args as string[])[0]
    const videoEle = dom?.querySelector('video') as HTMLVideoElement
    videoEle.src = ''
    request('/video/view/info', {
        uid: config.user_info.user_id,
        session: config.user_info.session,
        video_id: videoId
    }, (data) => {
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
    })
})
poncon.start()


/**
 * 加载视频列表
 * @param type_id 分类 ID
 * @param page 页码 初始值为 0
 * @param pageSize 每页加载数量
 */
function loadVideoList(type_id: string, page: number = 0, pageSize: number = 24) {
    const listEle = document.querySelector('.poncon-home .video-list') as HTMLElement
    listEle.innerHTML = ''
    request('/video/view/list', {
        uid: config.user_info.user_id,
        session: config.user_info.session,
        is_review: 0,
        is_new: 1,
        v: 0,
        label_id: type_id,
        page: page + 1,
        page_size: pageSize,
    }, (data) => {
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
                            <img src="${changeToHttp(item.href_image)}" alt="${item.name}" class="card-img-top">
                        </div>
                        <div class="card-body d-flex flex-column">
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
    })
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


function parseDuration(duration: number) {
    const hour = Math.floor(duration / 3600)
    const min = Math.floor((duration - hour * 3600) / 60)
    const sec = duration - hour * 3600 - min * 60
    let str = ''
    str += hour > 0 ? `${hour} 时 ` : ''
    str += min > 0 ? `${min} 分 ` : ''
    str += sec > 0 ? `${sec} 秒` : ''
    return str
}



/** 将 URL 的协议改成 HTTP */
function changeToHttp(url: string) {
    return url.replace(/^https?:/, 'http:')
}