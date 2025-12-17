Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
  },
  methods: {
    onAgreeGetPhoneNumber(
      this: WechatMiniprogram.Component.TrivialInstance,
      e: WechatMiniprogram.ButtonGetPhoneNumber
    ) {
      this.triggerEvent("agree", e.detail);
    },
    onDeny(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent("deny");
    },
    toService(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent("toservice");
    },
    toPrivacy(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent("toprivacy");
    },
  },
});
