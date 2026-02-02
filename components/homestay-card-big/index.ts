Component({
    properties: {
        homestay: {
            type: Object,
            value: {},
        },
    },
    methods: {
        onTap() {
            this.triggerEvent('tap', { homestay: this.data.homestay })
        },
        onCompanionsTap() {
            const homestay = this.data.homestay
            if (homestay && homestay.id) {
                wx.navigateTo({
                    url: `/pages/user/list/index?title=入住过的人&type=6&id=${homestay.id}`,
                })
            }
        },
    },
})
