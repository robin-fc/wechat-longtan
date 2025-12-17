Page({
  onAgree(this: WechatMiniprogram.PageInstance) {
    wx.setStorageSync('privacyAccepted', true)
    wx.navigateBack()
  }
})
