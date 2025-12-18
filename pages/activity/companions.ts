import { fetchActivityDetail } from '../../api/activity'
import type { CompanionInfo } from '../../model/user'
import { goBack } from '../../utils/navigation'

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

Page<CompanionsPageState>({
  data: {
    companions: [],
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.Query
  ) {
    const activityId = options.activityId as string
    if (!activityId) {
      return
    }
    const activity = await fetchActivityDetail(activityId)
    if (!activity) {
      return
    }
    const companions = activity.companions.companions.map(
      (c: CompanionInfo, index: number) => ({
        id: c.id,
        avatarUrl: c.avatar ? c.avatar.url : '',
        nickname: c.nickname,
        bio: index % 2 === 0 ? '热爱自然与乡村文化' : '期待与你一起同行',
        isFollowed: index % 3 === 0,
      })
    )
    this.setData({
      companions,
    })
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
    if (target.isFollowed) {
      wx.showModal({
        title: '取消关注',
        content: '确定要取消关注该用户吗？',
        success: (res) => {
          if (res.confirm) {
            list[index] = {
              ...target,
              isFollowed: false,
            }
            this.setData({
              companions: list,
            })
          }
        },
      })
      return
    }
    list[index] = {
      ...target,
      isFollowed: true,
    }
    this.setData({
      companions: list,
    })
  },
})\n\n*** End Patch"} ***!
