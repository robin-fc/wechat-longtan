import { fetchMyProfile } from '../../api/mine'
import { smartNavigateTo } from '../../utils/navigation'

Page({
  data: {
    profile: null as WechatMiniprogram.IAnyObject | null,
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    const profile = await fetchMyProfile()
    this.setData({
      profile: profile || null,
    })
  },
  onEditProfileTap() {
    wx.showToast({
      title: '资料编辑功能待接入',
      icon: 'none',
    })
  },
  onFollowersTap() {
    wx.showToast({
      title: '粉丝列表待接入',
      icon: 'none',
    })
  },
  onFollowingTap() {
    wx.showToast({
      title: '关注列表待接入',
      icon: 'none',
    })
  },
  onWalletTap() {
    smartNavigateTo('/pages/mine/assets')
  },
  onMyActivitiesTap() {
    smartNavigateTo('/pages/mine/activities')
  },
  onMyStaysTap() {
    smartNavigateTo('/pages/mine/stays')
  },
  onServiceTap() {
    smartNavigateTo('/pages/agreement/service')
  },
  onPrivacyTap() {
    smartNavigateTo('/pages/agreement/privacy')
  },
  onLogoutTap() {
    wx.clearStorageSync()
    smartNavigateTo('/pages/login/index')
  },
})

