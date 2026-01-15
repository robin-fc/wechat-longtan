import { fetchMyProfile, fetchUserSummary } from '../../api/mine'
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
        tagList?: { label: string; className: string }[]
      })
    | null
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
      const [profile, summary] = await Promise.all([
        fetchMyProfile(),
        fetchUserSummary().catch(() => ({
          followingCount: 0,
          followerCount: 0,
          asset: 0,
        })),
      ])
      if (profile) {
        if (profile.logo) {
          profile.logo = profile.logo.trim()
        }

        // 模拟/处理扩展数据
        const extendedProfile = {
          ...profile,
          joinTime: formatYMD(profile.joinTime) || '2025年04月22日',
          followingCount: Number(summary.followingCount || 0),
          followerCount: Number(summary.followerCount || 0),
          assets: Number((summary as any).asset || 0),
          gender: profile.sex || 2, // 默认为女
          tagList: buildUserTagsView(profile.memberLevel, profile.memberTags),
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
