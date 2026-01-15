import { getActivityDetail } from '../../api/activity'
import { AppUserFollow, AppUserUnfollow } from '../../api/user-follow'
import { goBack } from '../../utils/navigation'

interface FavoriteItemView {
  id: string
  avatarUrl: string
  nickname: string
  bio: string
  isFollowed: boolean
}

interface FavoritesPageState {
  companions: FavoriteItemView[]
}

Page<FavoritesPageState, WechatMiniprogram.IAnyObject>({
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
      const detail = await getActivityDetail(Number(activityId))
      const users = (detail.favoriteUsers || []).slice()
      const companions: FavoriteItemView[] = users.map((u) => ({
        id: String(u.userId),
        avatarUrl: u.logo || '/assets/images/default-avatar.png',
        nickname: u.memberName || u.wxName || `User ${u.userId}`,
        bio: u.introduction || '',
        isFollowed: false,
      }))
      this.setData({ companions })
    } catch (e) {
      console.error('获取收藏用户失败', e)
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
    const list = (this.data as FavoritesPageState).companions.slice()
    const index = list.findIndex((item) => item.id === id)
    if (index === -1) {
      return
    }
    const target = list[index]
    const followed = !!target.isFollowed
    const reqBody = { followeeId: Number(id) }
    const doReq = followed ? AppUserUnfollow(reqBody) : AppUserFollow(reqBody)
    doReq
      .then(() => {
        list[index] = { ...target, isFollowed: !followed }
        this.setData({ companions: list })
      })
      .catch(() => {
        wx.showToast({ title: '操作失败', icon: 'none' })
      })
  },
})

