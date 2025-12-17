Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    onAgreeGetPhoneNumber(e) {
      this.triggerEvent('agree', e.detail)
    },
    onDeny() {
      this.triggerEvent('deny')
    },
    toService() {
      this.triggerEvent('toservice')
    },
    toPrivacy() {
      this.triggerEvent('toprivacy')
    }
  }
})
