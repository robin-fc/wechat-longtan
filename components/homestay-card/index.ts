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
  },
  methods: {
    onTap(this: WechatMiniprogram.Component.TrivialInstance) {
      this.triggerEvent('tap', { homestay: this.data.homestay })
    },
    onCompanionsTap(this: WechatMiniprogram.Component.TrivialInstance) {
      const homestay = this.data.homestay
      if (homestay && homestay.id) {
        wx.navigateTo({
          url: `/pages/homestay/companions?homestayId=${homestay.id}`,
          success: (res) => {
            res.eventChannel.emit('acceptDataFromOpenerPage', {
              data: homestay.stayedUsers || [],
            })
          },
        })
      }
    },
  },
})

