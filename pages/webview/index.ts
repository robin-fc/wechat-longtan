Page({
    data: {
        url: ''
    },
    onLoad(options: { url?: string }) {
        if (options.url) {
            this.setData({
                url: decodeURIComponent(options.url)
            })
        }
    }
})
