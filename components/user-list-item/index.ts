Component({
    properties: {
        user: {
            type: Object,
            value: {},
        },
        showFollow: {
            type: Boolean,
            value: true
        }
    },
    data: {
        currentUserId: ''
    },
    attached() {
        const userIdStorage = wx.getStorageSync('userId')
        if (userIdStorage) {
            this.setData({ currentUserId: String(userIdStorage) })
        }
    },
    methods: {
        onTap() {
            const user = this.properties.user || {}
            const userId = String(user.userId || user.id || '')
            if (userId && userId === this.data.currentUserId) {
                wx.switchTab({ url: '/pages/mine/index' })
                return
            }
            this.triggerEvent('tap', { user: this.properties.user })
        },
        onFollowTap() {
            this.triggerEvent('follow', { user: this.properties.user })
        }
    }
})
