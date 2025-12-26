import { getData, postData } from '../../utils/request'
import type { FollowUserItem } from '../../model/user'
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

Page<CompanionsPageState, WechatMiniprogram.IAnyObject>({
  data: {
    companions: [],
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const followers = await getData<FollowUserItem[]>(
      '/app-api/daolongtan/user-follow/followers'
    )
    const companions = (followers || []).map((u) => ({
      id: String(u.userId),
      avatarUrl: u.avatar || '',
      nickname: String(u.userId),
      bio: u.introduction || '',
      isFollowed: true,
    }))
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
