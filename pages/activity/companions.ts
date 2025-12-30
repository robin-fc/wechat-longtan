import { getActivityRegistrations } from '../../api/activity'
import { postData } from '../../utils/request'
import { goBack } from '../../utils/navigation'
import { formatYMDHM } from '../../utils/date'

interface CompanionItemView {
  id: string
  avatarUrl: string
  nickname: string
  bio: string
  isFollowed: boolean
}

interface CompanionsPageState {
  companions: CompanionItemView[]
}

Page<CompanionsPageState, WechatMiniprogram.IAnyObject>({
  data: {
    companions: [],
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
        bio: u.registrationTime ? `报名时间: ${formatYMDHM(u.registrationTime)}` : '',
        isFollowed: false, // 默认未关注，后续如果有接口可以更新
      }))

      this.setData({
        companions,
      })
    } catch (e) {
      console.error('获取同行人员失败', e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },
  onBackTap() {
    goBack()
  },
  onFollowTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const id = e.currentTarget.dataset.id as string
    const list = (this.data as CompanionsPageState).companions.slice()
    const index = list.findIndex((item) => item.id === id)
    if (index === -1) {
      return
    }
    const target = list[index]
    const followed = !!target.isFollowed
    const reqBody = { followeeId: Number(id) }
    const doReq = followed
      ? postData<boolean>('/app-api/daolongtan/user-follow/unfollow', reqBody)
      : postData<boolean>('/app-api/daolongtan/user-follow/follow', reqBody)
    doReq
      .then(() => {
        list[index] = {
          ...target,
          isFollowed: !followed,
        }
        this.setData({ companions: list })
      })
      .catch(() => {
        wx.showToast({ title: '操作失败', icon: 'none' })
      })
  },
})

