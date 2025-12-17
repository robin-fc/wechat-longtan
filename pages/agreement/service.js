Page({
  onAgree() {
    wx.setStorageSync('privacyAccepted', true)
    wx.navigateBack()
  }
})
