Component({
  properties: {
    companions: {
      type: Object,
      value: {
        companions: [],
        totalCount: 0,
      },
    },
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('tap')
    },
  },
})

