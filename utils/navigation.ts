export function smartNavigateTo(url: string): void {
  const pages = getCurrentPages()
  if (pages.length >= 9) {
    wx.redirectTo({ url })
  } else {
    wx.navigateTo({ url })
  }
}

export function goBack(delta = 1): void {
  if (getCurrentPages().length > 1) {
    wx.navigateBack({ delta })
  } else {
    wx.reLaunch({ url: '/pages/home/index' })
  }
}

