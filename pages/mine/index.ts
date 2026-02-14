import { fetchMyProfile, fetchUserSummary } from '../../api/mine'
import { updateUserInfo } from '../../api/user'
import { smartNavigateTo } from '../../utils/navigation'
import type { UserProfile } from '../../model/user'
import { formatYMD } from '../../utils/date'
import { buildUserTagsView } from '../../utils/user-tags'

interface MineState {
  profile:
  | (UserProfile & {
    joinTime?: string
    followingCount?: number
    followerCount?: number
    assets?: number
    gender?: number
    levelTags?: { label: string; className: string; action?: string }[]
    roleTags?: { label: string; className: string; action?: string }[]
    nomadApplyStatus?: string
  })
  | null
  showPhoneAuthModal: boolean
}

Page<MineState, WechatMiniprogram.IAnyObject>({
  data: {
    profile: null,
    showPhoneAuthModal: false,
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
      wx.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        smartNavigateTo(`/pages/login/index?returnUrl=${encodeURIComponent('/pages/mine/index')}`)
      }, 1500)
      return
    }

    // 每次显示时尝试获取最新用户信息
    try {
      const [profile, summary] = await Promise.all([
        fetchMyProfile(),
        fetchUserSummary().catch(() => ({
          followingCount: 0,
          followerCount: 0,
          asset: 0,
        })),
      ])
      if (profile) {
        if (!profile.memberPhone) {
          setTimeout(() => {
            this.setData({ showPhoneAuthModal: true })
          }, 1000)
        }

        if (profile.logo) {
          profile.logo = profile.logo.trim()
        }

        const tags = buildUserTagsView(profile.memberLevel, profile.memberTags, profile.nomadApplyStatus)

        // 模拟/处理扩展数据
        const extendedProfile = {
          ...profile,
          memberNumber: profile.memberNumber || '000000',
          joinTime: formatYMD(profile.joinTime) || '2025年04月22日',
          followingCount: Number(summary.followingCount || 0),
          followerCount: Number(summary.followerCount || 0),
          assets: Number((summary as any).asset || 0),
          gender: profile.sex || 2, // 默认为女
          levelTags: tags.levelTags,
          roleTags: tags.roleTags,
          noMadTags: tags.noMadTags,
          nomadApplyStatus: profile.nomadApplyStatus,
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
    const userId = this.data.profile?.id
    if (userId) {
      smartNavigateTo(`/pages/user/list/index?title=粉丝&type=2&id=${userId}`)
    }
  },
  onFollowingTap() {
    const userId = this.data.profile?.id
    if (userId) {
      smartNavigateTo(`/pages/user/list/index?title=关注&type=1&id=${userId}`)
    }
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
  onTagTap(e: WechatMiniprogram.BaseEvent) {
    const action = e.currentTarget.dataset.action
    if (action === 'goApply') {
      smartNavigateTo('/pages/digital-nomad/apply/index')
    }
  },
  onShareAppMessage() {
    const profile = this.data.profile
    if (!profile || !profile.id) {
      return {
        title: 'DAO龙潭 - 用户主页',
        path: '/pages/home/index',
      }
    }
    return {
      title: `${profile.memberName || profile.wxName || '用户'}的主页`,
      path: `/pages/user/other-profile/index?userId=${profile.id}`,
    }
  },
  closePhoneAuthModal() {
    this.setData({ showPhoneAuthModal: false })
  },
  async onPhoneAuthSuccess(e: any) {
    const { phone } = e.detail
    this.setData({ showPhoneAuthModal: false })

    // Update user info with phone number
    if (phone && phone.phoneNumber) {
      try {
        await updateUserInfo({
          memberPhone: phone.phoneNumber
        })
        wx.showToast({ title: '绑定成功', icon: 'success' })
        // Refresh profile to update UI if needed
        this.onShow()
      } catch (error) {
        console.error('Failed to update phone number', error)
        wx.showToast({ title: '更新手机号失败', icon: 'none' })
      }
    } else {
      wx.showToast({ title: '绑定成功', icon: 'success' })
    }
  },
})
