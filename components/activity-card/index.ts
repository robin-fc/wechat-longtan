Component({
  properties: {
    activity: {
      type: Object,
      value: {},
    },
    layout: {
      type: String,
      value: 'vertical',
    },
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('tap', { activity: this.data.activity })
    },
  },
})
