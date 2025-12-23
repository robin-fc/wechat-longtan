import { fetchActivityDetail } from '../../api/activity'
import type { Activity } from '../../model/activity'
import { smartNavigateTo, goBack } from '../../utils/navigation'

interface ActivityDetailState {
  activity: Activity | null
  isCollected: boolean
  menuTop: number
  menuHeight: number
}

Page<ActivityDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    activity: null,
    isCollected: false,
    menuTop: 0,
    menuHeight: 44,
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const id = options.id as string
    if (!id) {
      return
    }
    const activity = await fetchActivityDetail(id)
    if (!activity) {
      return
    }
    const menuRect = wx.getMenuButtonBoundingClientRect()
    this.setData({
      activity,
      menuTop: menuRect ? menuRect.top : 0,
      menuHeight: menuRect ? menuRect.height : 44,
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
        detail.id
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
      `/pages/space/detail?id=${encodeURIComponent(detail.space.id)}`
    )
  },
  onToggleCollect(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const prev = (this.data as ActivityDetailState).isCollected
    this.setData({
      isCollected: !prev,
    })
  },
  onShareTap() {
    wx.showShareMenu({
      withShareTicket: true,
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
