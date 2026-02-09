Component({
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    message: {
      type: String,
      value: '完成数字游民认证申请就可以使用此功能了哦！',
    },
  },
  methods: {
    onApply() {
      this.triggerEvent('apply')
    },
    onSkip() {
      this.triggerEvent('skip')
    },
  },
})
