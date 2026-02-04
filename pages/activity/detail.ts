import {
  getActivityDetail,
  getActivityRegistrations,
  favoriteActivity,
  unfavoriteActivity,
  shareActivity,
  createReview,
} from '../../api/activity'
import { AppUserFollow, AppUserUnfollow } from '../../api/user-follow'
import { ActivityDetail, RegistrationUser } from '../../model/activity'
import { smartNavigateTo, goBack } from '../../utils/navigation'
import { formatYMDHM, formatSmartTimeRange } from '../../utils/date'

interface CompanionsData {
  companions: { id: number; avatar: { url: string } }[]
  totalCount: number
}

interface ActivityDetailState {
  activity: ActivityDetail | null
  favoriteCountText: string
  menuTop: number
  menuHeight: number
  registrationCount: number
  registrationLimit: number
  isSelf: boolean
  registeredUsers: RegistrationUser[]
  companionsData: CompanionsData
  favoriteCompanionsData: CompanionsData
  reviewContent: string
}

Page<ActivityDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    activity: null,
    favoriteCountText: '',
    menuTop: 0,
    menuHeight: 44,
    registrationCount: 0,
    registrationLimit: 0,
    isSelf: false,
    registeredUsers: [],
    companionsData: {
      companions: [],
      totalCount: 0,
    },
    favoriteCompanionsData: {
      companions: [],
      totalCount: 0,
    },
    reviewContent: '',
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const idRaw = options.id as string
    if (!idRaw) {
      wx.showToast({
        title: '提示',
        detail: '活动id不存在',
      })
      return
    }
    const id = Number(idRaw)
    if (!Number.isFinite(id) || id <= 0) {
      wx.showToast({
        title: '提示',
        detail: '活动id不合法',
      })
      return
    }
    const activity = await getActivityDetail(id)
    if (!activity) {
      return
    }

    // 单独请求报名列表
    const res = await getActivityRegistrations(id)
    const companionsData = {
      companions: (res.userList || []).map((u) => ({
        id: u.userId,
        avatar: { url: u.logo || '/assets/images/default-avatar.png' },
      })),
      totalCount: res.count || 0,
    }
    this.setData({
      registeredUsers: res.userList || [],
      registrationCount: res.count || 0,
      companionsData,
    })

    const menuRect = wx.getMenuButtonBoundingClientRect()
    const userId = wx.getStorageSync('userId')
    const isSelf =
      activity.organizer && String(activity.organizer.userId) === String(userId)

    const formattedActivity: ActivityDetail = {
      ...activity,
      startTime: formatYMDHM(activity.startTime),
      endTime: formatYMDHM(activity.endTime),
      formattedTimeRange: formatSmartTimeRange(activity.startTime, activity.endTime),
    }

    const favoriteCount = formattedActivity.favoriteCount || 0
    const favoriteCountText =
      favoriteCount >= 10000
        ? `${(Math.round((favoriteCount / 10000) * 10) / 10).toFixed(
          1
        )} 万人收藏`
        : `${favoriteCount} 人收藏`

    const favoriteCompanionsData: CompanionsData = {
      companions: (formattedActivity.favoriteUsers || []).slice(0, 10).map((u) => ({
        id: u.userId,
        avatar: { url: u.logo || '/assets/images/default-avatar.png' },
      })),
      totalCount: favoriteCount || 0,
    }

    this.setData({
      activity: formattedActivity,
      favoriteCountText,
      // registrationCount: formattedActivity.registeredCount || 0, // 使用单独接口的数据
      registrationLimit: formattedActivity.isLimitParticipants
        ? formattedActivity.maxParticipants
        : '无限制',
      menuTop: menuRect ? menuRect.top : 0,
      menuHeight: menuRect ? menuRect.height : 44,
      isSelf,
      favoriteCompanionsData,
    })
  },
  onBackTap() {
    goBack()
  },
  onFavoriteUsersTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const detail = this.data.activity
    if (!detail) {
      return
    }
    smartNavigateTo(
      `/pages/user/list/index?title=活动收藏&type=3&id=${encodeURIComponent(
        String(detail.id)
      )}`
    )
  },
  onCompanionsTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const detail = this.data.activity
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
    const detail = this.data.activity
    if (!detail) {
      return
    }

    const mapImages = detail.space?.mapImages || []
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
    const detail = this.data.activity
    if (!detail) {
      return
    }
    smartNavigateTo(
      `/pages/space/detail?id=${encodeURIComponent(String(detail.space?.id))}`
    )
  },
  onToggleCollect(this: WechatMiniprogram.Page.TrivialInstance) {
    const prev = this.data.activity?.isFavorited || false
    const detail = this.data.activity
    if (!detail) {
      return
    }
    const req = prev
      ? unfavoriteActivity(detail.id)
      : favoriteActivity(detail.id)
    req
      .then(() => {
        this.setData({ activity: { ...detail, isFavorited: !prev } })
        getActivityDetail(detail.id)
          .then((freshDetail) => {
            const favoriteCount = freshDetail.favoriteCount || 0
            const favoriteCountText =
              favoriteCount >= 10000
                ? `${(Math.round((favoriteCount / 10000) * 10) / 10).toFixed(
                  1
                )} 万人收藏`
                : `${favoriteCount} 人收藏`
            const favoriteCompanionsData: CompanionsData = {
              companions: (freshDetail.favoriteUsers || []).slice(0, 10).map((u) => ({
                id: u.userId,
                avatar: { url: u.logo || '/assets/images/default-avatar.png' },
              })),
              totalCount: favoriteCount || 0,
            }
            this.setData({
              activity: {
                ...detail,
                favoriteCount,
                favoriteUsers: (freshDetail.favoriteUsers || []).slice(0, 5),
              },
              favoriteCountText,
              favoriteCompanionsData,
            })
          })
          .catch(() => {
            wx.showToast({
              title: prev ? '取消收藏失败' : '收藏失败',
              icon: 'none',
            })
          })
      })
      .catch((e) => {
        wx.showToast({
          title: prev ? '取消收藏失败' : '收藏失败',
          icon: 'none',
        })
      })
  },

  onOrganizerTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const detail = this.data.activity as ActivityDetail

    if (!detail || !detail.organizer || !detail.organizer.userId) return
    smartNavigateTo(
      `/pages/user/other-profile/index?userId=${detail.organizer.userId}`
    )
  },

  async onToggleFollowOrganizer(this: WechatMiniprogram.Page.TrivialInstance) {
    const activity = (this.data as ActivityDetailState).activity
    if (!activity || !activity.organizer) return

    const isFollowing = (this.data as ActivityDetailState).activity?.organizer
      .follow
    const organizerId = activity.organizer.userId

    if (isFollowing) {
      wx.showModal({
        title: '提示',
        content: '确定要取消关注该主理人吗？',
        success: async (res) => {
          if (res.confirm) {
            await AppUserUnfollow({ followeeId: organizerId })

            this.setData({
              activity: {
                ...activity,
                organizer: { ...activity.organizer, follow: false },
              },
            })
            wx.showToast({ title: '已取消关注', icon: 'none' })
          }
        },
      })
    } else {
      await AppUserFollow({ followeeId: organizerId })
      this.setData({
        activity: {
          ...activity,
          organizer: { ...activity.organizer, follow: true },
        },
      })
      wx.showToast({ title: '关注成功', icon: 'none' })
    }
  },
  onEditTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const detail = (this.data as ActivityDetailState).activity
    if (!detail) return

    wx.showToast({
      title: '编辑功能即将上线',
      icon: 'none'
    })
    // In future: smartNavigateTo(`/pages/activity/publish?id=${detail.id}`)
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
      imageUrl: detail.logo,
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
      imageUrl: detail.logo,
    }
  },
  onSignupTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const detail = (this.data as ActivityDetailState).activity
    if (!detail) {
      return
    }

    if (detail.auditStatus !== '审核通过') {
      let msg = '该活动未审核通过，无法报名'
      if (detail.auditStatus === '待审核') {
        msg = '该活动正在审核中，暂时无法报名'
      } else if (detail.auditStatus === '审核不通过') {
        msg = '该活动审核不通过，无法报名'
      }
      wx.showModal({
        title: '提示',
        content: msg,
        showCancel: false,
      })
      return
    }

    if (detail.activityStatus === '已结束') {
      wx.showModal({
        title: '提示',
        content: '该活动已结束，无法报名',
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
      `/pages/user/list/index?title=已报名用户&type=0&id=${activity.id}`
    )
  },

  onReviewInput(e: WechatMiniprogram.Input) {
    this.setData({
      reviewContent: e.detail.value,
    })
  },

  async onSubmitReview(this: WechatMiniprogram.Page.TrivialInstance) {
    const data = this.data as ActivityDetailState
    const content = data.reviewContent.trim()
    if (!content) {
      wx.showToast({ title: '请输入评价内容', icon: 'none' })
      return
    }
    if (!data.activity) return

    wx.showLoading({ title: '提交中...' })
    try {
      const ok = await createReview({
        targetId: data.activity.id,
        type: 1, // 1=Activity
        content,
      })
      wx.hideLoading()
      if (ok) {
        wx.showToast({ title: '评价成功', icon: 'success' })
        this.setData({ reviewContent: '' })
      } else {
        wx.showToast({ title: '评价失败', icon: 'none' })
      }
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: '网络错误', icon: 'none' })
    }
  },
})
