import {
  getActivityDetail,
  favoriteActivity,
  unfavoriteActivity,
  shareActivity,
} from '../../api/activity'
import { AppUserFollow, AppUserUnfollow } from '../../api/user-follow'
import { ActivityDetail } from '../../model/activity'
import { smartNavigateTo, goBack } from '../../utils/navigation'

interface ActivityDetailState {
  activityDetail: ActivityDetail | null
  menuTop: number
  menuHeight: number
  registrationCount: number
  registrationLimit: number
  isSelf: boolean
}

Page<ActivityDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    activityDetail: null,
    menuTop: 0,
    menuHeight: 44,
    registrationCount: 0,
    registrationLimit: 0,
    isSelf: false,
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
    const activityDetail = await   getActivityDetail(id) 
    if (!activityDetail) {
      return
    }

    const menuRect = wx.getMenuButtonBoundingClientRect()
    const userId = wx.getStorageSync('userId')
    const isSelf =
      activityDetail.organizer &&
      String(activityDetail.organizer.userId) === String(userId)

    const favoriteCount = activityDetail.favoriteCount || 0
    const favoriteCountText =
      favoriteCount >= 10000
        ? `${(Math.round((favoriteCount / 10000) * 10) / 10).toFixed(
            1
          )} 万人收藏`
        : `${favoriteCount} 人收藏`

    this.setData({
      activityDetail,
      registrationCount: activityDetail.registeredCount || 0,
      registrationLimit: activityDetail.isLimitParticipants
        ? activityDetail.maxParticipants
        : '无限制',
      menuTop: menuRect ? menuRect.top : 0,
      menuHeight: menuRect ? menuRect.height : 44,
      isFavorited: activityDetail.isFavorited,
      favoriteUsers: (activityDetail.favoriteUsers || []).slice(0, 5),
      favoriteCount,
      favoriteCountText,
      isSelf,
    })
  },
  onBackTap() {
    goBack()
  },
  onCompanionsTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const detail = this.data.activityDetail
    if (!detail) {
      return
    }
    smartNavigateTo(
      `/pages/activityDetail/companions?activityId=${encodeURIComponent(
        String(detail.id)
      )}`
    )
  },
  onOpenMapTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const detail = this.data.activityDetail
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
    const detail = this.data.activityDetail
    if (!detail) {
      return
    }
    smartNavigateTo(
      `/pages/space/detail?id=${encodeURIComponent(String(detail.space?.id))}`
    )
  },
  onToggleCollect(this: WechatMiniprogram.Page.TrivialInstance) {
    const prev = this.data.isFavorited
    const detail = this.data.activityDetail
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
    const detail = this.data.activityDetail as ActivityDetail

    if (!detail || !detail.organizer || !detail.organizer.userId) return
    smartNavigateTo(
      `/pages/user/other-profile/index?userId=${detail.organizer.userId}`
    )
  },

  async onToggleFollowOrganizer(this: WechatMiniprogram.Page.TrivialInstance) {
    const activityDetail = (this.data as ActivityDetailState).activityDetail
    if (!activityDetail || !activityDetail.organizer) return

    const isFollowing = (
      this.data as ActivityDetailState
    ).activityDetail?.favoriteUsers?.some(
      (it) => it.userId === wx.getStorageSync('userId')
    )
    const organizerId = activityDetail.organizer.userId

    if (isFollowing) {
      wx.showModal({
        title: '提示',
        content: '确定要取消关注该主理人吗？',
        success: async (res) => {
          if (res.confirm) {
            await AppUserUnfollow({ followeeId: organizerId })

            this.setData({
              activityDetail: { ...activityDetail, isFavorited: false },
            })
            wx.showToast({ title: '已取消关注', icon: 'none' })
          }
        },
      })
    } else {
      await AppUserFollow({ followeeId: organizerId })
      this.setData({ activityDetail: { ...activityDetail, isFavorited: true } })
      wx.showToast({ title: '关注成功', icon: 'none' })
    }
  },
  onShareTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const detail = (this.data as ActivityDetailState).activityDetail
    if (!detail) {
      return
    }
    // 记录分享行为，但不依赖它来唤起分享（通过 button open-type="share" 唤起）
    shareActivity(detail.id).catch(() => {
      console.error('Share record failed')
    })
  },
  onShareAppMessage() {
    const detail = (this.data as unknown as ActivityDetailState).activityDetail
    if (!detail) {
      return {
        title: '龙潭村活动',
        path: '/pages/home/index',
      }
    }
    return {
      title: detail.title,
      path: `/pages/activityDetail/detail?id=${detail.id}`,
      imageUrl: detail.logo,
    }
  },
  onShareTimeline() {
    const detail = (this.data as unknown as ActivityDetailState).activityDetail
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
    const detail = (this.data as ActivityDetailState).activityDetail
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
      `/pages/activityDetail-order/confirm?activityId=${encodeURIComponent(
        detail.id
      )}`
    )
  },

  onRegistrationTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const activityDetail = (this.data as ActivityDetailState).activityDetail
    if (!activityDetail) {
      return
    }
    smartNavigateTo(
      `/pages/user/list/index?title=已报名用户&type=registration&id=${activityDetail.id}`
    )
  },
})
