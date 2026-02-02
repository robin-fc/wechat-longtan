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
    size: {
      type: String,
      value: 'large',
    },
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('tap')
    },
  },
})
