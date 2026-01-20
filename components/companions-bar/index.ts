Component({
  properties: {
    companions: {
      type: Object,
      value: {
        companions: [],
        totalCount: 0,
      },
    },
    isHideCount: {
      type: Boolean,
      value: false,
    },
    size: {
      type: String,
      value: 'normal',
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

