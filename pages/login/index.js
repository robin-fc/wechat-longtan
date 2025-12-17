Page({
  data: {
    checked: false,
    showModal: false
  },
  onCheckChange(e) {
    const val = !!e.detail.value.length
    this.setData({ checked: val })
    wx.setStorageSync('privacyAccepted', val)
  },
  onLoginTap() {
    if (!this.data.checked) {
      this.setData({ showModal: true })
      return
    }
  },
  onGetPhoneNumber(e) {
    const detail = e.detail || {}
    if (detail.errMsg && detail.errMsg.indexOf('ok') !== -1) {
      wx.setStorageSync('phoneAuth', {
        code: detail.code || '',
        time: Date.now()
      })
      wx.setStorageSync('isLoggedIn', true)
      wx.redirectTo({ url: '/pages/home/index' })
    }
  },
  onModalAgree(e) {
    const detail = e.detail || {}
    this.setData({ checked: true, showModal: false })
    if (detail.errMsg && detail.errMsg.indexOf('ok') !== -1) {
      wx.setStorageSync('phoneAuth', {
        code: detail.code || '',
        time: Date.now()
      })
      wx.setStorageSync('isLoggedIn', true)
      wx.redirectTo({ url: '/pages/home/index' })
    }
  },
  onModalDeny() {
    this.setData({ showModal: false })
    wx.setStorageSync('isLoggedIn', false)
    wx.redirectTo({ url: '/pages/home/index' })
  },
  goService() {
    wx.navigateTo({ url: '/pages/agreement/service' })
  },
  goPrivacy() {
    wx.navigateTo({ url: '/pages/agreement/privacy' })
  },
  onShow() {
    const accepted = !!wx.getStorageSync('privacyAccepted')
    this.setData({ checked: accepted })
  }
})
