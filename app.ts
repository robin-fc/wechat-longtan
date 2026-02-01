App<IAppOption>({
  globalData: {},
  onLaunch() {
    wx.loadFontFace({
      family: 'Barlow-Medium',
      source: 'url("https://cdn.jsdelivr.net/npm/@fontsource/barlow/files/barlow-latin-500-normal.woff2")',
      global: true,
      success: console.log,
      fail: console.error
    })
  }
})
