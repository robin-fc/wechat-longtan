import { AppUserFollow, AppUserUnfollow } from '../../api/user-follow'

Component({
    properties: {
        userId: {
            type: String,
            value: '',
        },
        isFollowed: {
            type: Boolean,
            value: false,
        },
        customClass: {
            type: String,
            value: '',
        }
    },

    data: {
        loading: false
    },

    methods: {


        async handleTap() {
            const { userId, isFollowed } = this.properties
            if (!userId) return

            if (isFollowed) {
                // Unfollow flow with confirmation
                wx.showModal({
                    title: '取消关注',
                    content: '确定要取消关注吗？',
                    success: async (res) => {
                        if (res.confirm) {
                            await this.doToggle(false)
                        }
                    }
                })
            } else {
                // Follow flow direct
                await this.doToggle(true)
            }
        },

        async doToggle(nextState: boolean) {
            const { userId } = this.properties
            const userIdNum = Number(userId)

            this.setData({ isFollowed: nextState })
            // Emit event
            this.triggerEvent('change', { isFollowed: nextState, userId })

            try {
                if (nextState) {
                    await AppUserFollow({ followeeId: userIdNum })
                    wx.showToast({ title: '已关注', icon: 'none' })
                } else {
                    await AppUserUnfollow({ followeeId: userIdNum })
                    wx.showToast({ title: '已取消关注', icon: 'none' })
                }
            } catch (e) {
                // Revert
                const revertState = !nextState
                this.setData({ isFollowed: revertState })
                this.triggerEvent('change', { isFollowed: revertState, userId })
                wx.showToast({ title: '操作失败', icon: 'none' })
            }
        }
    }
})
