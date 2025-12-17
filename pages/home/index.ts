Page({
  onShow(this: WechatMiniprogram.PageInstance) {
    const logged = !!wx.getStorageSync('isLoggedIn')
    if (!logged) {
      wx.setNavigationBarTitle({ title: '首页（未登录）' })
    } else {
      wx.setNavigationBarTitle({ title: '首页' })
    }
  }
})
