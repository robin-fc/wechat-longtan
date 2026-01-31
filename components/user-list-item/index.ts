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
    methods: {
        onTap() {
            // Navigate to user profile or detail if needed
            // Currently just event trigger if parent wants to handle
            this.triggerEvent('tap', { user: this.properties.user })
        },
        onFollowTap() {
            this.triggerEvent('follow', { user: this.properties.user })
        }
    }
})
