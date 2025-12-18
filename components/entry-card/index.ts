Component({
  properties: {
    title: {
      type: String,
      value: '',
    },
    iconUrl: {
      type: String,
      value: '',
    },
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('tap')
    },
  },
})

