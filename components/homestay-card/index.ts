Component({
  properties: {
    homestay: {
      type: Object,
      value: {},
    },
    layout: {
      type: String,
      value: 'horizontal',
    },
    showCompanions: {
      type: Boolean,
      value: true,
    },
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('tap', { homestay: this.data.homestay })
    },
    onCompanionsTap(this: WechatMiniprogram.Component.TrivialInstance) {
      const homestay = this.data.homestay
      if (homestay && homestay.id) {
        wx.navigateTo({
          url: `/pages/user/list/index?title=入住过的人&type=6&id=${homestay.id}`,
        })
      }
    },
  },
})

