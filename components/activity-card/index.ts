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
    compact: {
      type: Boolean,
      value: false,
    },
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('tap', { activity: this.data.activity })
    },
  },
})
