Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
  },
  methods: {
    onAgreeTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent("agree");
    },
    onDeny(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent("deny");
    },
    toService(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('toservice')
    },
    toPrivacy(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('toprivacy')
    },
  },
})
