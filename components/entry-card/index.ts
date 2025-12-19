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
    align: {
      type: String,
      value: 'align-center',
    },
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('tap')
    },
  },
})
