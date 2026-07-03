/**
 * 我的 - 自己视角（v2 API）
 *
 * 数据源：
 *   fetchProfileHeader     → 用户基本信息、等级、标签
 *   fetchDashboardSummary  → 仪表盘统计（社区生活 / 项目 / 活动 / 入住）
 *   fetchTransferWaitConfirmList → 待收款
 */

import { fetchTransferWaitConfirmList } from '../../api/mine'
import { fetchProfileHeader, fetchDashboardSummary } from '../../api/mine-v2'
import { updateUserInfo } from '../../api/user'
import { smartNavigateTo } from '../../utils/navigation'
import { formatYMD } from '../../utils/date'
import type {
  AppUserProfileHeaderRespVO,
  AppUserProfileDashboardSummaryRespVO,
  AppUserProfileCommunityLifeSummaryVO,
  AppUserProfileProjectSummaryVO,
  AppUserProfileActivitySummaryVO,
  AppUserProfileStaySummaryVO,
  AppUserProfileFriendGroupVO,
} from '../../model/mine-v2'

// ====== 页面状态 ======

interface MineState {
  profile: ProfileView | null
  communityLife: AppUserProfileCommunityLifeSummaryVO
  project: AppUserProfileProjectSummaryVO
  activity: AppUserProfileActivitySummaryVO
  stay: AppUserProfileStaySummaryVO
  /** 我感兴趣的 */
  interested: AppUserProfileFriendGroupVO
  /** 对我感兴趣的 */
  interestedInMe: AppUserProfileFriendGroupVO
  showPhoneAuthModal: boolean
  showTransferPopup: boolean
  transferList: { packageInfo: string; index: number }[]
}

interface ProfileView {
  id: number
  memberName: string
  wxName: string
  logo: string
  memberNumber: string
  joinTimeText: string
  gender: number
  desc: string
  levelTags: { label: string; className: string }[]
  roleTags: { label: string; className: string }[]
  /** 关联的基地/民宿 */
  homestayId: number
  homestayName: string
}

// ====== 工具函数 ======

function levelToClass(level: string): string {
  const map: Record<string, string> = {
    老村民: 'tag-normal', 新村民: 'tag-new',
    数字游民: 'tag-nomad-green', 游客: 'tag-nomad-green',
  }
  return map[level] || 'tag-normal'
}

/** memberTag 按位置映射设计稿色板 */
function tagToClass(tag: string, index: number): string {
  const classes = ['tag-host', 'tag-role', 'tag-dev', 'tag-other']
  return classes[index] || 'tag-other'
}

function buildProfileView(header: AppUserProfileHeaderRespVO): ProfileView {
  const levelStr = header.memberLevel || ''
  const tags = header.memberTags || []
  return {
    id: header.id,
    memberName: header.memberName || '',
    wxName: header.wxName || '',
    logo: header.logo || '/assets/images/default-avatar.png',
    memberNumber: header.memberNumber || '000000',
    joinTimeText: formatYMD(header.joinTime) || '',
    gender: header.sex || 2,
    desc: header.desc || '这个人很懒，什么都没写~',
    levelTags: levelStr ? [{ label: levelStr, className: levelToClass(levelStr) }] : [],
    roleTags: tags.map((t, i) => ({ label: t, className: tagToClass(t, i) })),
    homestayId: header.homestays?.[0]?.id || 0,
    homestayName: header.homestays?.[0]?.name || '',
  }
}

function emptyInterest(): AppUserProfileFriendGroupVO {
  return { count: 0, users: [] }
}

function safeDashboard(d: AppUserProfileDashboardSummaryRespVO | null) {
  return {
    communityLife: d?.communityLife || { articleCount: 0, videoCount: 0 },
    project: d?.project || { participatedCount: 0, publishedCount: 0 },
    activity: d?.activity || {
      participatedCount: 0, publishedCount: 0, collectedCount: 0,
      pendingReviewCount: 0, reviewedCount: 0, earnings: 0,
    },
    stay: d?.stay || { pendingPaymentCount: 0, pendingAuditCount: 0, pendingCheckInCount: 0 },
    interested: d?.friends?.interested || emptyInterest(),
    interestedInMe: d?.friends?.interestedInMe || emptyInterest(),
  }
}

// ====== Page ======

Page<MineState, WechatMiniprogram.IAnyObject>({
  data: {
    profile: null,
    communityLife: { articleCount: 0, videoCount: 0 },
    project: { participatedCount: 0, publishedCount: 0 },
    activity: { participatedCount: 0, publishedCount: 0, collectedCount: 0, pendingReviewCount: 0, reviewedCount: 0, earnings: 0 },
    stay: { pendingPaymentCount: 0, pendingAuditCount: 0, pendingCheckInCount: 0 },
    interested: { count: 0, users: [] },
    interestedInMe: { count: 0, users: [] },
    showPhoneAuthModal: false,
    showTransferPopup: false,
    transferList: [],
  },

  async onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 })
    }

    const accessToken = wx.getStorageSync('accessToken')
    if (!accessToken) {
      wx.setStorageSync('isLoggedIn', false)
      wx.setStorageSync('profileCompleted', false)
      this.setData({ profile: null })
      const loginCanceledTime = wx.getStorageSync('loginCanceled')
      if (loginCanceledTime && Date.now() - Number(loginCanceledTime) < 2000) {
        wx.removeStorageSync('loginCanceled')
        wx.switchTab({ url: '/pages/home/index' })
        return
      }
      smartNavigateTo(`/pages/login/index?returnUrl=${encodeURIComponent('/pages/mine/index')}`)
      return
    }

    try {
      const [header, dashboard] = await Promise.all([
        fetchProfileHeader(),
        fetchDashboardSummary(),
      ])

      if (header) {
        if (!header.memberPhone) {
          setTimeout(() => this.setData({ showPhoneAuthModal: true }), 1000)
        }

        const sd = safeDashboard(dashboard)

        this.setData({
          profile: buildProfileView(header),
          communityLife: sd.communityLife,
          project: sd.project,
          activity: sd.activity,
          stay: sd.stay,
          interested: sd.interested,
          interestedInMe: sd.interestedInMe,
        })
      }
    } catch (e) {
      console.error('Fetch profile failed', e)
    }

    this.checkTransferList()
  },

  async checkTransferList() {
    try {
      const res = await fetchTransferWaitConfirmList()
      const list: { packageInfo: string }[] = Array.isArray(res) ? res : (res as any).data || []
      if (list.length > 0) {
        this.setData({
          transferList: list.map((item, index) => ({ ...item, index: index + 1 })),
          showTransferPopup: true,
        })
      }
    } catch (err) {
      console.error('Fetch transfer wait confirm list failed', err)
    }
  },

  // ====== 导航 ======
  onEditProfileTap() { smartNavigateTo('/pages/mine/profile-edit/index') },
  onHomestayTap() {
    const id = this.data.profile?.homestayId
    if (id) smartNavigateTo(`/pages/homestay/detail?id=${id}`)
  },
  onNomadApplyTap() { smartNavigateTo('/pages/digital-nomad/apply/index') },
  onNewVillagerApplyTap() { smartNavigateTo('/pages/new-villager/apply/index') },
  onOldVillagerApplyTap() { smartNavigateTo('/pages/old-villager/apply/index') },
  onStatTap(e: WechatMiniprogram.BaseEvent) {
    const type = e.currentTarget.dataset.type as string
    if (!type) return

    // 活动相关
    if (type.startsWith('activity-')) {
      const tabMap: Record<string, string> = {
        'activity-joined': 'joined',
        'activity-published': 'published',
        'activity-collected': 'collected',
        'activity-pendingReview': 'to-comment',
        'activity-reviewed': 'commented',
        'activity-earnings': 'joined',
      }
      smartNavigateTo(`/pages/mine/activities?filter=${tabMap[type] || ''}`)
      return
    }

    // 入住相关
    if (type.startsWith('stay-')) {
      const tabMap: Record<string, string> = {
        'stay-pendingPayment': 'unpaid',
        'stay-pendingAudit': 'pending',
        'stay-pendingCheckIn': 'upcoming',
      }
      smartNavigateTo(`/pages/mine/stays?filter=${tabMap[type] || ''}`)
      return
    }

    // 项目相关
    if (type.startsWith('project-')) {
      const filter = type === 'project-published' ? 'published' : 'joined'
      smartNavigateTo(`/pages/mine/projects?filter=${filter}`)
      return
    }

    // 社区生活
    if (type === 'article' || type === 'video') {
      const filter = type === 'video' ? '2' : '1'
      smartNavigateTo(`/pages/mine/community?filter=${filter}`)
      return
    }
  },
  onProjectTap() { smartNavigateTo('/pages/mine/projects') },
  onMyActivitiesTap() { smartNavigateTo('/pages/mine/activities') },
  onMyStaysTap() { smartNavigateTo('/pages/mine/stays') },
  onServiceTap() { smartNavigateTo('/pages/agreement/service') },
  onPrivacyTap() { smartNavigateTo('/pages/agreement/privacy') },
  onCheckInTap() { smartNavigateTo('/pages/user/checkin/index') },
  onDanmuTap() { smartNavigateTo('/pages/user/barrage/index') },
  onInterestInMeTap() {
    const app = getApp<IAppOption>()
    app.globalData.interestUsers = this.data.interestedInMe.users
    smartNavigateTo(`/pages/user/list/index?title=对我感兴趣的&type=interest`)
  },
  onMyInterestsTap() {
    const app = getApp<IAppOption>()
    app.globalData.interestUsers = this.data.interested.users
    smartNavigateTo(`/pages/user/list/index?title=我感兴趣的&type=interest`)
  },
  onLogoutTap() { wx.clearStorageSync(); smartNavigateTo('/pages/login/index') },

  onShareAppMessage() {
    const profile = this.data.profile
    if (!profile || !profile.id) return { title: 'DAO龙潭 - 用户主页', path: '/pages/home/index' }
    return {
      title: `${profile.memberName || profile.wxName || '用户'}的主页`,
      path: `/pages/user/other-profile/index?userId=${profile.id}`,
    }
  },

  closePhoneAuthModal() { this.setData({ showPhoneAuthModal: false }) },
  closeTransferPopup() { this.setData({ showTransferPopup: false }) },

  async onPhoneAuthSuccess(e: any) {
    const { phone } = e.detail
    this.setData({ showPhoneAuthModal: false })
    if (phone?.phoneNumber) {
      try {
        await updateUserInfo({ memberPhone: phone.phoneNumber })
        wx.showToast({ title: '绑定成功', icon: 'success' })
        this.onShow()
      } catch { wx.showToast({ title: '更新手机号失败', icon: 'none' }) }
    } else {
      wx.showToast({ title: '绑定成功', icon: 'success' })
    }
  },

  onTransferItemTap(e: WechatMiniprogram.BaseEvent) {
    const packageInfo = e.currentTarget.dataset.package as string
    if (!(wx as any).canIUse('requestMerchantTransfer')) {
      wx.showModal({ content: '你的微信版本过低，请更新至最新版本。', showCancel: false })
      return
    }
    ;(wx as any).requestMerchantTransfer({
      mchId: '1104693914', appId: 'wxf60fc5c32017bf2f', package: packageInfo,
      success: (res: any) => {
        const list = (this.data as MineState).transferList.filter(i => i.packageInfo !== packageInfo)
        this.setData({ transferList: list, showTransferPopup: list.length > 0 })
      },
      fail: (res: any) => console.error('requestMerchantTransfer fail:', res),
    })
  },
})
