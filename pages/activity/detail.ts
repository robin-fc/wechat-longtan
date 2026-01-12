import {
  getActivityByIdFromList,
  getActivityDetail,
  favoriteActivity,
  unfavoriteActivity,
  shareActivity,
  getActivityRegistrations,
} from '../../api/activity'
import {
  AppUserFollow,
  AppUserUnfollow,
  AppUserFollow_getFollowings,
} from '../../api/user-follow'
import {
  type Activity,
  type FavoriteUser,
  ActivityTypeLabel,
  type RegistrationUser,
} from '../../model/activity'
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
  isFollowingOrganizer: boolean
  registrationCount: number
  registrationLimit: number
  registrationUsers: RegistrationUser[]
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
    isFollowingOrganizer: false,
    registrationCount: 0,
    registrationLimit: 0,
    registrationUsers: [],
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const idRaw = options.id as string
    if (!idRaw) {
      return
    }
    const id = Number(idRaw)
    if (!Number.isFinite(id) || id <= 0) {
      return
    }

    const [base, detail] = await Promise.all([
      getActivityByIdFromList(id).catch(() => undefined),
      getActivityDetail(id),
    ])
    if (!detail) {
      return
    }

    const baseFallback: Activity =
      base ??
      ({
        id: detail.id,
        title: detail.title,
        logo: detail.logo,
        isFree: detail.isFree,
        startTime: detail.startTime,
        endTime: detail.endTime,
        spaceId: detail.space.id,
        spaceName: detail.space.name,
        fee: detail.fee,
        detail: detail.detail,
        activityType: detail.activityType,
        auditStatus: detail.auditStatus,
      } as unknown as Activity)
    const activity: Activity = {
      ...baseFallback,
      auditStatus: detail.auditStatus ?? baseFallback.auditStatus,
      poster: baseFallback.poster ?? {
        id: String(detail.id),
        url: detail.logo || '/assets/images/activity.jpg',
      },
      activityType:
        detail.activityType !== undefined
          ? ActivityTypeLabel[detail.activityType]
          : baseFallback.activityType,
      timeRange: {
        startTime:
          formatYMDHM(detail.startTime) ||
          baseFallback.timeRange?.startTime ||
          '',
        endTime:
          formatYMDHM(detail.endTime) || baseFallback.timeRange?.endTime || '',
      },
      price: {
        amount: detail.fee ?? (baseFallback.price?.amount || 0),
        currency: 'CNY',
        unit: baseFallback.price?.unit || '人',
      },
      space: {
        id: baseFallback.space?.id ?? detail.space.id,
        name: detail.space.name || baseFallback.space?.name || '',
        address: detail.space.address || baseFallback.space?.address || '',
        mapImages:
          detail.space.mapImages || baseFallback.space?.mapImages || [],
      },
      organizer: detail.organizer
        ? {
            ...detail.organizer,
            tags: (() => {
              console.log('organizer.tags', detail.organizer.tags)
              const raw = detail.organizer.tags
              const organizerTagsMap: Record<number, string> = {
                0: '空间主理人',
                1: '活动发起人',
              }
              if (Array.isArray(raw)) {
                return raw.map((s) => {
                  const n = Number(s)
                  return !Number.isNaN(n) && organizerTagsMap[n] ? organizerTagsMap[n] : String(s)
                })
              }
              if (typeof raw === 'string' && raw) {
                const s = raw.trim()
                if (s.startsWith('[') && s.endsWith(']')) {
                  try {
                    const arr = JSON.parse(s)
                    if (Array.isArray(arr)) {
                      return arr
                        .map((v) => String(v))
                        .map((t) => {
                          const n = Number(t)
                          return !Number.isNaN(n) && organizerTagsMap[n] ? organizerTagsMap[n] : t
                        })
                    }
                  } catch {}
                }
                return s
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t) => {
                    const n = Number(t)
                    return !Number.isNaN(n) && organizerTagsMap[n] ? organizerTagsMap[n] : t
                  })
              }
              return []
            })() as any,
          }
        : undefined,
      detail: detail.detail || baseFallback.detail,
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
          registrationCount: reg.count,
          registrationUsers: (reg.userList || []).slice(0, 5),
          registrationLimit: detail.maxParticipants || 0,
        })
      })
      .catch((e) => {
        console.error('Fetch registrations failed', e)
      })

    // Fetch follow status
    if (activity.organizer) {
      AppUserFollow_getFollowings()
        .then((res) => {
          const list = res.data || []
          const isFollowing = list.some(
            (u) => u.userId === activity.organizer!.userId
          )
          this.setData({ isFollowingOrganizer: isFollowing })
        })
        .catch(() => {
          // Ignore error, default to false
        })
    }
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
              favoriteCount,
              favoriteCountText,
              favoriteUsers: (freshDetail.favoriteUsers || []).slice(0, 5),
            })
          })
          .catch(() => {})
      })
      .catch((e) => {
        wx.showToast({
          title: prev ? '取消收藏失败' : '收藏失败',
          icon: 'none',
        })
      })
  },

  onOrganizerTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const activity = (this.data as ActivityDetailState).activity
    if (!activity || !activity.organizer || !activity.organizer.userId) return
    smartNavigateTo(`/pages/user/other-profile/index?userId=${activity.organizer.userId}`)
  },

  onToggleFollowOrganizer(this: WechatMiniprogram.Page.TrivialInstance) {
    const activity = (this.data as ActivityDetailState).activity
    if (!activity || !activity.organizer) return

    const isFollowing = (this.data as ActivityDetailState).isFollowingOrganizer
    const organizerId = activity.organizer.userId

    if (isFollowing) {
      wx.showModal({
        title: '提示',
        content: '确定要取消关注该主理人吗？',
        success: (res) => {
          if (res.confirm) {
            AppUserUnfollow({ followeeId: organizerId }).then(() => {
              this.setData({ isFollowingOrganizer: false })
              wx.showToast({ title: '已取消关注', icon: 'none' })
            })
          }
        },
      })
    } else {
      AppUserFollow({ followeeId: organizerId }).then(() => {
        this.setData({ isFollowingOrganizer: true })
        wx.showToast({ title: '关注成功', icon: 'none' })
      })
    }
  },
  onShareTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const detail = (this.data as ActivityDetailState).activity
    if (!detail) {
      return
    }
    // 记录分享行为，但不依赖它来唤起分享（通过 button open-type="share" 唤起）
    shareActivity(detail.id).catch(() => {
      console.error('Share record failed')
    })
  },
  onShareAppMessage() {
    const detail = (this.data as unknown as ActivityDetailState).activity
    if (!detail) {
      return {
        title: '龙潭村活动',
        path: '/pages/home/index',
      }
    }
    return {
      title: detail.title,
      path: `/pages/activity/detail?id=${detail.id}`,
      imageUrl: detail.poster?.url,
    }
  },
  onShareTimeline() {
    const detail = (this.data as unknown as ActivityDetailState).activity
    if (!detail) {
      return {
        title: '龙潭村活动',
      }
    }
    return {
      title: detail.title,
      query: `id=${detail.id}`,
      imageUrl: detail.poster?.url,
    }
  },
  onSignupTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const detail = (this.data as ActivityDetailState).activity
    if (!detail) {
      return
    }

    if (detail.auditStatus !== 1) {
      let msg = '该活动未审核通过，无法报名'
      if (detail.auditStatus === 0) {
        msg = '该活动正在审核中，暂时无法报名'
      } else if (detail.auditStatus === 2) {
        msg = '该活动审核不通过，无法报名'
      }
      wx.showModal({
        title: '提示',
        content: msg,
        showCancel: false,
      })
      return
    }

    smartNavigateTo(
      `/pages/activity-order/confirm?activityId=${encodeURIComponent(
        detail.id
      )}`
    )
  },

  onRegistrationTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const activity = (this.data as ActivityDetailState).activity
    if (!activity) {
      return
    }
    smartNavigateTo(
      `/pages/user/list/index?title=已报名用户&type=registration&id=${activity.id}`
    )
  },
})
