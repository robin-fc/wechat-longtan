Component({
  properties: {
    homestay: {
      type: Object,
      value: null,
    },
    layout: {
      type: String,
      value: 'horizontal',
    },
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('tap', { homestay: this.data.homestay })
    },
  },
})

