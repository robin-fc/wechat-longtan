Component({
    methods: {
        onApply() {
            this.triggerEvent('apply')
        },
        onSkip() {
            this.triggerEvent('skip')
        }
    }
})
