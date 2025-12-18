Component({
  properties: {
    collection: {
      type: Object,
      value: null,
    },
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('tap', { collection: this.data.collection })
    },
  },
})

