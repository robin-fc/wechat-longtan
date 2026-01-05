import {
  getActivityByIdFromList,
  getActivityDetail,
  favoriteActivity,
  unfavoriteActivity,
  shareActivity,
  getActivityRegistrations,
} from '../../api/activity'
import type { Activity, FavoriteUser } from '../../model/activity'
import { smartNavigateTo, goBack } from '../../utils/navigation'
import { formatYMDHM } from '../../utils/date'

interface ActivityDetailState {
  activity: Activity | null
  isFavorited: boolean
  favoriteUsers: FavoriteUser[]
  menuTop: number
  menuHeight: number
  favoriteCount: number
  favoriteCountText: string
}

Page<ActivityDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    activity: null,
    isFavorited: false,
    favoriteUsers: [],
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
    const activity: Activity = {
      ...base,
      poster: base.poster ?? {
        id: String(detail.id),
        url: detail.logo || '/assets/images/activity.jpg',
      },
      timeRange: {
        startTime:
          formatYMDHM(detail.startTime) || base.timeRange?.startTime || '',
        endTime: formatYMDHM(detail.endTime) || base.timeRange?.endTime || '',
      },
      price: {
        amount: detail.fee ?? (base.price?.amount || 0),
        currency: 'CNY',
        unit: base.price?.unit || '人',
      },
      space: {
        id: base.space?.id ?? detail.space.id,
        name: detail.space.name || base.space?.name || '',
        address: detail.space.address || base.space?.address || '',
        mapImages: detail.space.mapImages || base.space?.mapImages || [],
      },
      organizer: detail.organizer,
      detail: detail.detail || base.detail,
    }
    const menuRect = wx.getMenuButtonBoundingClientRect()

    const favoriteCount = detail.favoriteCount || 0
    const favoriteCountText =
      favoriteCount >= 10000
        ? `${(Math.round((favoriteCount / 10000) * 10) / 10).toFixed(1)} 万人收藏`
        : `${favoriteCount} 人收藏`

    this.setData({
      activity,
      menuTop: menuRect ? menuRect.top : 0,
      menuHeight: menuRect ? menuRect.height : 44,
      isFavorited: detail.isFavorited,
      favoriteUsers: (detail.favoriteUsers || []).slice(0, 5),
      favoriteCount,
      favoriteCountText,
    })

    // Fetch companions data
    getActivityRegistrations(activity.id)
      .then((reg) => {
        const companions = {
          totalCount: reg.count,
          companions: (reg.userList || []).slice(0, 3).map((u) => ({
            avatar: { url: u.logo || '/assets/images/default-avatar.png' },
            nickname: u.memberName || u.wxName,
          })),
        }
        this.setData({
          'activity.companions': companions,
        })
      })
      .catch((e) => {
        console.error('Fetch registrations failed', e)
      })
  },

  onBackTap() {
    goBack()
  },
  onCompanionsTap(this: WechatMiniprogram.Page.TrivialInstance) {
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
  onOpenMapTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const activity = (this.data as ActivityDetailState).activity
    if (!activity) {
      return
    }

    const mapImages = activity.space?.mapImages || []
    if (mapImages && mapImages.length > 0) {
      wx.previewImage({
        current: mapImages[0], // 当前显示图片的http链接
        urls: mapImages, // 需要预览的图片http链接列表
      })
    } else {
      wx.showToast({
        title: '暂无地图信息',
        icon: 'none',
      })
    }
  },
  onSpaceDetailTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const detail = (this.data as ActivityDetailState).activity
    if (!detail) {
      return
    }
    smartNavigateTo(
      `/pages/space/detail?id=${encodeURIComponent(String(detail.spaceId))}`
    )
  },
  onToggleCollect(this: WechatMiniprogram.Page.TrivialInstance) {
    const prev = (this.data as ActivityDetailState).isFavorited
    const detail = (this.data as ActivityDetailState).activity
    if (!detail) {
      return
    }
    const req = prev
      ? unfavoriteActivity(detail.id)
      : favoriteActivity(detail.id)
    req
      .then(() => {
        this.setData({ isFavorited: !prev })
        getActivityDetail(detail.id)
          .then((freshDetail) => {
            const favoriteCount = freshDetail.favoriteCount || 0
            const favoriteCountText =
              favoriteCount >= 10000
                ? `${(Math.round((favoriteCount / 10000) * 10) / 10).toFixed(
                    1
                  )} 万人收藏`
                : `${favoriteCount} 人收藏`
            this.setData({
              isFavorited: freshDetail.isFavorited,
              favoriteUsers: (freshDetail.favoriteUsers || []).slice(0, 5),
              favoriteCount,
              favoriteCountText,
            })
          })
          .catch((e) => {
            console.error('Refresh detail failed', e)
          })
      })
      .catch(() => {
        wx.showToast({ title: '操作失败', icon: 'none' })
      })
  },
  onShareTap(this: WechatMiniprogram.Page.TrivialInstance) {
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
  onSignupTap(this: WechatMiniprogram.Page.TrivialInstance) {
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
