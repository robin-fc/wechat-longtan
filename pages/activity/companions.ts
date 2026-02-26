import { getActivityRegistrations } from '../../api/activity'
import { AppUserFollow, AppUserUnfollow } from '../../api/user-follow'
import { goBack, smartNavigateTo } from '../../utils/navigation'

interface CompanionItemView {
  id: string
  avatarUrl: string
  nickname: string
  bio: string
  follow: boolean
}

interface CompanionsPageState {
  companions: CompanionItemView[]
  currentUserId: string
}

Page<CompanionsPageState, WechatMiniprogram.IAnyObject>({
  data: {
    companions: [],
    currentUserId: '',
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const activityId = options.activityId as string
    if (!activityId) {
      return
    }

    try {
      const result = await getActivityRegistrations(Number(activityId))
      const userList = result.userList || []
      const companions: CompanionItemView[] = userList.map((u) => ({
        id: String(u.userId),
        avatarUrl: u.logo || '',
        nickname: u.memberName || u.wxName || `User ${u.userId}`,
        bio: u.introduction || '',
        follow: u.follow || false, // 默认未关注，后续如果有接口可以更新
      }))

      this.setData({
        companions,
      })

      const userIdStorage = wx.getStorageSync('userId')
      if (userIdStorage) {
        this.setData({ currentUserId: String(userIdStorage) })
      }
    } catch (e) {
      console.error('获取同行人员失败', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },
  onBackTap() {
    goBack()
  },
  onUserTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CustomEvent
  ) {
    const { user } = e.detail
    const userId = user.id
    if (userId) {
      if (userId === this.data.currentUserId) {
        wx.switchTab({ url: '/pages/mine/index' })
        return
      }
      smartNavigateTo(
        `/pages/user/other-profile/index?userId=${userId}&isFollowed=${user.follow}`
      )
    }
  },
  onFollowTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CustomEvent
  ) {
    const { user } = e.detail
    const id = user.id as string
    const list = (this.data as CompanionsPageState).companions.slice()
    const index = list.findIndex((item) => item.id === id)
    if (index === -1) {
      return
    }
    const target = list[index]
    const followed = !!target.follow
    const reqBody = { followeeId: Number(id) }
    const doReq = followed
      ? AppUserUnfollow(reqBody)
      : AppUserFollow(reqBody)
    doReq
      .then(() => {
        list[index] = {
          ...target,
          follow: !followed,
        }
        this.setData({ companions: list })
      })
      .catch(() => {
        wx.showToast({ title: '操作失败', icon: 'none' })
      })
  },
})

