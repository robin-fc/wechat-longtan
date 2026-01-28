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
    data: {},
    methods: {
        onTap() {
            this.triggerEvent('click', { user: this.data.user })
        },
        onFollowTap() {
            this.triggerEvent('follow', { user: this.data.user })
        }
    }
})
