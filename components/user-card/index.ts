Component({
    properties: {
        user: {
            type: Object,
            value: {}
        },
        showFollow: {
            type: Boolean,
            value: false
        },
        isSelf: {
            type: Boolean,
            value: false
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
            const user = this.data.user || {}
            const userId = String(user.userId || user.id || '')
            if (userId && userId === this.data.currentUserId) {
                wx.switchTab({ url: '/pages/mine/index' })
                return
            }
            this.triggerEvent('click', { user: this.data.user })
        },
        onFollowTap() {
            this.triggerEvent('follow', { user: this.data.user })
        }
    }
})
