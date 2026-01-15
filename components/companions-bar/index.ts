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
  observers: {
    'companions.totalCount': function (newVal: number) {
      if (newVal > 0) {
        this.setData({ showCount: true })
      } else {
        this.setData({ showCount: false })
      }
    },
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('tap')
    },
  },
})

