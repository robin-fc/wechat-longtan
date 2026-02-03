App<IAppOption>({
  globalData: {},
  onLaunch() {
    wx.loadFontFace({
      family: 'DIN-Medium',
      source: 'url("https://daolongtan.cn/fonts/DIN-Medium.otf")',
      global: true,
      success: console.log,
      fail: console.error
    })
  }
})
