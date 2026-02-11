Page({
  data: {
    isAgreed: false,
  },
  onLoad() {
    const isAgreed = wx.getStorageSync('serviceAccepted') || false
    this.setData({ isAgreed })
  },
  onAgree(this: WechatMiniprogram.Page.TrivialInstance) {
    if (this.data.isAgreed) return
    wx.setStorageSync('serviceAccepted', true)
    this.setData({ isAgreed: true })
    wx.navigateBack()
  },
})
