import { fetchMyProfile } from '../../api/mine'
import { smartNavigateTo } from '../../utils/navigation'

Page({
  data: {
    profile: null as WechatMiniprogram.IAnyObject | null,
  },
  async onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3,
      })
    }
    
    // 检查登录状态
    const accessToken = wx.getStorageSync('accessToken')
    if (!accessToken) {
      this.setData({ profile: null })
      return
    }

    // 每次显示时尝试获取最新用户信息
    try {
      const profile = await fetchMyProfile()
      if (profile && profile.logo) {
        profile.logo = profile.logo.trim()
      }
      this.setData({
        profile: profile || null,
      })
    } catch (e) {
      console.error('Fetch profile failed', e)
      // 如果获取失败（例如 token 过期），可能需要清除 profile 或保持原样
      // 这里选择保持原样或不做处理，依靠 request.ts 的拦截逻辑（如果有）
    }
  },
  onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    // onLoad 不再负责数据加载，由 onShow 接管
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

