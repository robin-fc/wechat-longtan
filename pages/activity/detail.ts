import { getActivityByIdFromList, getActivityDetail, getFavoriteCount, favoriteActivity, unfavoriteActivity, shareActivity, getActivityRegistrations } from '../../api/activity'
import type { Activity } from '../../model/activity'
import { smartNavigateTo, goBack } from '../../utils/navigation'

interface ActivityDetailState {
  activity: Activity | null
  isCollected: boolean
  menuTop: number
  menuHeight: number
  favoriteCount: number
  favoriteCountText: string
}

Page<ActivityDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    activity: null,
    isCollected: false,
    menuTop: 0,
    menuHeight: 44,
    favoriteCount: 0,
    favoriteCountText: '0 人收藏',
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const id = options.id as string
    if (!id) {
      return
    }
    const base = await getActivityByIdFromList(Number(id))
    if (!base) {
      return
    }
    const detail = await getActivityDetail(Number(id))
    const formatDate = (v: any): string => {
      if (v === undefined || v === null) return ''
      const s = String(v)
      const isNum = typeof v === 'number' || /^\d+$/.test(s)
      if (isNum) {
        const d = new Date(Number(v))
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}/${m}/${day}`
      }
      return s
    }
    const activity: Activity = {
      ...base,
      poster: base.poster ?? {
        id: String(detail.id),
        url: detail.logo || '/assets/images/activity.jpg',
      },
      timeRange: {
        startTime: formatDate(detail.startTime) || (base.timeRange?.startTime || ''),
        endTime: formatDate(detail.endTime) || (base.timeRange?.endTime || ''),
      },
      price: {
        amount: detail.fee ?? (base.price?.amount || 0),
        currency: 'CNY',
        unit: base.price?.unit || '人',
      },
      space: {
        id: base.space?.id ?? detail.space.id,
        name: detail.space.name || (base.space?.name || ''),
        address: detail.space.address || (base.space?.address || ''),
        mapImages: detail.space.mapImages || (base.space?.mapImages || []),
      },
      detail: detail.detail || base.detail,
    }
    const menuRect = wx.getMenuButtonBoundingClientRect()
    this.setData({
      activity,
      menuTop: menuRect ? menuRect.top : 0,
      menuHeight: menuRect ? menuRect.height : 44,
    })

    // Fetch companions data
    getActivityRegistrations(activity.id)
      .then((reg) => {
        const companions = {
          totalCount: reg.count,
          companions: (reg.userList || []).slice(0, 3).map((u) => ({
            avatar: { url: u.logo || '/assets/images/default-avatar.png' },
            nickname: u.memberName || u.wxName
          }))
        }
        this.setData({
          'activity.companions': companions
        })
      })
      .catch((e) => {
        console.error('Fetch registrations failed', e)
      })

    const cnt = await getFavoriteCount(activity.id).catch(() => 0)
    const count = typeof cnt === 'number' ? cnt : 0
    const text =
      count >= 10000
        ? `${(Math.round((count / 10000) * 10) / 10).toFixed(1)} 万人收藏`
        : `${count} 人收藏`
    this.setData({
      favoriteCount: count,
      favoriteCountText: text,
    })
  },

  onBackTap() {
    goBack()
  },
  onCompanionsTap(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const detail = (this.data as ActivityDetailState).activity
    if (!detail) {
      return
    }
    smartNavigateTo(
      `/pages/activity/companions?activityId=${encodeURIComponent(
        String(detail.id)
      )}`
    )
  },
  onOpenMapTap() {
    wx.showToast({
      title: '地图功能待接入',
      icon: 'none',
    })
  },
  onSpaceDetailTap(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const detail = (this.data as ActivityDetailState).activity
    if (!detail) {
      return
    }
    smartNavigateTo(
      `/pages/space/detail?id=${encodeURIComponent(String(detail.spaceId))}`
    )
  },
  onToggleCollect(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const prev = (this.data as ActivityDetailState).isCollected
    const detail = (this.data as ActivityDetailState).activity
    if (!detail) {
      return
    }
    const req = prev ? unfavoriteActivity(detail.id) : favoriteActivity(detail.id)
    req
      .then(() => {
        this.setData({ isCollected: !prev })
        getFavoriteCount(detail.id)
          .then((cnt) => {
            const count = typeof cnt === 'number' ? cnt : 0
            const text =
              count >= 10000
                ? `${(Math.round((count / 10000) * 10) / 10).toFixed(1)} 万人收藏`
                : `${count} 人收藏`
            this.setData({
              favoriteCount: count,
              favoriteCountText: text,
            })
          })
          .catch(() => {
            const curr = (this.data as ActivityDetailState).favoriteCount
            const delta = prev ? -1 : 1
            const count = Math.max(0, curr + delta)
            const text =
              count >= 10000
                ? `${(Math.round((count / 10000) * 10) / 10).toFixed(1)} 万人收藏`
                : `${count} 人收藏`
            this.setData({
              favoriteCount: count,
              favoriteCountText: text,
            })
          })
      })
      .catch(() => {
        wx.showToast({ title: '操作失败', icon: 'none' })
      })
  },
  onShareTap(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const detail = (this.data as ActivityDetailState).activity
    if (!detail) {
      return
    }
    shareActivity(detail.id)
      .then(() => {
        wx.showShareMenu({ withShareTicket: true })
        wx.showToast({ title: '可分享', icon: 'none' })
      })
      .catch(() => {
        wx.showToast({ title: '分享准备失败', icon: 'none' })
      })
  },
  onSignupTap(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const detail = (this.data as ActivityDetailState).activity
    if (!detail) {
      return
    }
    smartNavigateTo(
      `/pages/activity-order/confirm?activityId=${encodeURIComponent(
        detail.id
      )}`
    )
  },
})
