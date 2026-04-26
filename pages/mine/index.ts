import { fetchMyProfile, fetchUserSummary, fetchTransferWaitConfirmList } from '../../api/mine'
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
  showTransferPopup: boolean
  transferList: { packageInfo: string; index: number }[]
}

Page<MineState, WechatMiniprogram.IAnyObject>({
  data: {
    profile: null,
    showPhoneAuthModal: false,
    showTransferPopup: false,
    transferList: [],
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
      // 清除可能残留的登录标记，防止登录页因 isLoggedIn=true 立即弹回
      wx.setStorageSync('isLoggedIn', false)
      wx.setStorageSync('profileCompleted', false)
      this.setData({ profile: null })

      const loginCanceledTime = wx.getStorageSync('loginCanceled')
      if (loginCanceledTime && Date.now() - Number(loginCanceledTime) < 2000) {
        // 如果刚从登录页取消登录返回，直接跳回首页，防止死循环
        wx.removeStorageSync('loginCanceled')
        wx.switchTab({ url: '/pages/home/index' })
        return
      }

      smartNavigateTo(`/pages/login/index?returnUrl=${encodeURIComponent('/pages/mine/index')}`)
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

        // Check for merchant transfer confirmation
        if (profile) {
          fetchTransferWaitConfirmList().then(res => {
            // API response: { code: 0, data: [{packageInfo: '...'}] }
            const list: { packageInfo: string }[] = Array.isArray(res)
              ? res
              : (res as any).data || []
            if (list.length > 0) {
              this.setData({
                transferList: list.map((item, index) => ({ ...item, index: index + 1 })),
                showTransferPopup: true,
              })
            }
          }).catch(err => {
            console.error('Fetch transfer wait confirm list failed', err)
          })
        }
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
  onNomadApplyTap() {
    smartNavigateTo('/pages/digital-nomad/apply/index')
  },
  onNewVillagerApplyTap() {
    smartNavigateTo('/pages/new-villager/apply/index')
  },
  onOldVillagerApplyTap() {
    smartNavigateTo('/pages/old-villager/apply/index')
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
  onCheckInTap() {
    smartNavigateTo('/pages/user/checkin/index')
  },
  onDanmuTap() {
    smartNavigateTo('/pages/user/barrage/index')
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
  closeTransferPopup() {
    this.setData({ showTransferPopup: false })
  },
  onTransferItemTap(this: WechatMiniprogram.Page.TrivialInstance, e: WechatMiniprogram.BaseEvent) {
    const packageInfo = e.currentTarget.dataset.package as string
    if (!(wx as any).canIUse('requestMerchantTransfer')) {
      wx.showModal({
        content: '你的微信版本过低，请更新至最新版本。',
        showCancel: false,
      })
      return
    }
    ;(wx as any).requestMerchantTransfer({
      mchId: '1104693914',
      appId: 'wxf60fc5c32017bf2f',
      package: packageInfo,
      success: (res: any) => {
        console.log('requestMerchantTransfer success:', res)
        // Remove the successfully collected item from list
        const list = (this.data as MineState).transferList.filter(
          (item) => item.packageInfo !== packageInfo
        )
        this.setData({
          transferList: list,
          showTransferPopup: list.length > 0,
        })
      },
      fail: (res: any) => {
        console.error('requestMerchantTransfer fail:', res)
      },
    })
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
