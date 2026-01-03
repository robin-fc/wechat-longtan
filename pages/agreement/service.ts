Page({
  data: {
    isAgreed: false,
  },
  onLoad() {
    const isAgreed = wx.getStorageSync('privacyAccepted') || false
    this.setData({ isAgreed })
  },
  onAgree(this: WechatMiniprogram.Page.TrivialInstance) {
    if (this.data.isAgreed) return
    wx.setStorageSync('privacyAccepted', true)
    this.setData({ isAgreed: true })
    wx.navigateBack()
  },
})
