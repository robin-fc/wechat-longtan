import { fetchMyProfile } from '../../api/mine'
import { smartNavigateTo } from '../../utils/navigation'
import type { UserProfile } from '../../model/user'

interface MineState {
  profile: (UserProfile & {
    bgImage?: string
    joinTime?: string
    followingCount?: number
    followerCount?: number
    assets?: number
    tags?: string[]
    gender?: number
  }) | null
}

Page<MineState, WechatMiniprogram.IAnyObject>({
  data: {
    profile: null,
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
      if (profile) {
        if (profile.logo) {
          profile.logo = profile.logo.trim()
        }
        
        // 模拟/处理扩展数据
        const extendedProfile = {
          ...profile,
          bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1353&q=80',
          joinTime: '2025年04月22日',
          followingCount: 88,
          followerCount: 8,
          assets: 88.99,
          gender: profile.sex || 2, // 默认为女
          tags: [
            profile.memberLevel === '0' ? '老村民' : '新村民',
            ...(profile.memberTags ? profile.memberTags.split(',') : ['主理人'])
          ]
        }
        
        this.setData({
          profile: extendedProfile,
        })
      }
    } catch (e) {
      console.error('Fetch profile failed', e)
    }
  },
  onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    // onLoad 不再负责数据加载，由 onShow 接管
  },
  onEditProfileTap() {
    smartNavigateTo('/pages/mine/profile-edit/index')
  },
  onFollowersTap() {
    smartNavigateTo('/pages/user/list/index?title=粉丝&type=followers&id=mine')
  },
  onFollowingTap() {
    smartNavigateTo('/pages/user/list/index?title=关注&type=following&id=mine')
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

