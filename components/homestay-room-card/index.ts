Component({
  properties: {
    room: {
      type: Object,
      value: {},
    },
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('tap', { room: this.data.room })
    },
  },
})
