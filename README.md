# AVIN 视频

> 海量 AV 视频免费在线播放

## 项目信息

- 开发日期：2023 年 2 月 28 日
- 作者主页：https://apee.top
- 站点地址：https://oyps.github.io/avin-video/

## 待优化

- 图片等比例显示和缩放
- 后台播放时，显示正在播放，允许点击返回播放器

## 新的技术点

- 数据缓存

    以请求地址 + 请求参数为键，存储请求返回的数据，下次执行相同的请求，可直接读取缓存数据

    ```ts
    /** 缓存数据 */
    const dataCache: {
        [key: string]: any
    } = {}
    ```

    ```ts
    const postData = {
        uid: config.user_info.user_id,
        session: config.user_info.session,
        is_review: 0,
        is_new: 1,
        v: 0,
        label_id: type_id,
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
        // ...
    }
    ```