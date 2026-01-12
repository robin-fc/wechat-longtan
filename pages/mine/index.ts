import { fetchMyProfile, fetchUserSummary } from '../../api/mine'
import { smartNavigateTo } from '../../utils/navigation'
import type { UserProfile } from '../../model/user'
import { formatYMD } from '../../utils/date'

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

function parseMemberTags(v: unknown): string[] {
  const MemberTagMap: Record<string, string> = {
    '0': '空间主理人',
    '1': '活动发起人',
  }
  const codes = (() => {
    if (v === undefined || v === null) return []
    if (Array.isArray(v)) return v.map((it) => String(it))
    if (typeof v === 'string') {
      const s = v.trim()
      if (!s) return []
      if (s.startsWith('[') && s.endsWith(']')) {
        try {
          const arr = JSON.parse(s)
          if (Array.isArray(arr)) return arr.map((it) => String(it))
        } catch {}
      }
      return s.split(',')
    }
    return []
  })()
    .map((it) => String(it).trim().replace(/^"+|"+$/g, ''))
    .filter(Boolean)

  return codes.map((code) => MemberTagMap[code]).filter(Boolean)
}

function mapMemberLevelLabel(level: unknown): string {
  const v = level === undefined || level === null ? '' : String(level)
  if (v === '0') return '老村民'
  if (v === '1') return '新村民'
  if (v === '2') return '数字游民'
  if (v === '3') return '游客'
  return '游客'
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
        fetchMyProfile().catch(() => null),
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
        const memberTags = parseMemberTags(profile.memberTags)
        const extendedProfile = {
          ...profile,
          bgImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1353&q=80',
          joinTime: formatYMD(profile.joinTime) || '2025年04月22日',
          followingCount: Number(summary.followingCount || 0),
          followerCount: Number(summary.followerCount || 0),
          assets: Number((summary as any).asset || 0),
          gender: profile.sex || 2, // 默认为女
          tags: [
            mapMemberLevelLabel(profile.memberLevel),
            ...(memberTags.length ? memberTags : ['空间主理人']),
          ],
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

