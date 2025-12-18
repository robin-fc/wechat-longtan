Component({
  properties: {
    activity: {
      type: Object,
      value: null,
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

