import { getActivityByIdFromList, getActivityDetail } from '../../api/activity'
import { createActivityOrder, generatePayParams } from '../../api/order'
import type { Activity } from '../../model/activity'
import type { ActivityOrder } from '../../model/order'
import { goBack, smartNavigateTo } from '../../utils/navigation'
import { formatYMDHM } from '../../utils/date'

interface ConfirmOrderState {
  activity: Activity | null
  order: ActivityOrder
}

const emptyOrder: ActivityOrder = {
  id: '',
  activityId: '',
  title: '',
  spaceName: '',
  timeRange: {
    startTime: '',
    endTime: '',
  },
  participantName: '',
  participantPhone: '',
  notice: '',
  status: 'unpaid',
  totalPrice: {
    amount: 0,
    currency: 'CNY',
  },
}

Page<ConfirmOrderState, WechatMiniprogram.IAnyObject>({
  data: {
    activity: null,
    order: emptyOrder,
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const activityId = options.activityId as string
    if (!activityId) {
      return
    }
    const id = Number(activityId)
    if (!Number.isFinite(id) || id <= 0) {
      return
    }

    const [base, detail] = await Promise.all([
      getActivityByIdFromList(id).catch(() => undefined),
      getActivityDetail(id),
    ])

    if (!detail) return

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
      } as unknown as Activity)

    const activity: Activity = {
      ...baseFallback,
      poster: baseFallback.poster ?? {
        id: String(detail.id),
        url: detail.logo || '/assets/images/activity.jpg',
      },
      timeRange: {
        startTime:
          formatYMDHM(detail.startTime) ||
          baseFallback.timeRange?.startTime ||
          '',
        endTime:
          formatYMDHM(detail.endTime) || baseFallback.timeRange?.endTime || '',
      },
      price: {
        amount: detail.fee ?? baseFallback.price?.amount ?? 0,
        currency: 'CNY',
        unit: baseFallback.price?.unit || '人',
      },
      spaceId: baseFallback.spaceId ?? detail.space.id,
      spaceName: detail.space.name || baseFallback.spaceName || '',
      space: {
        id: baseFallback.space?.id ?? detail.space.id,
        name: detail.space.name || baseFallback.space?.name || '',
        address: detail.space.address || baseFallback.space?.address || '',
        mapImages: detail.space.mapImages || baseFallback.space?.mapImages || [],
      },
      organizer: detail.organizer,
      detail: detail.detail || baseFallback.detail,
    }

    const order: ActivityOrder = {
      ...emptyOrder,
      id: `order-${Date.now()}`,
      activityId: activity.id,
      title: activity.title,
      spaceName: activity?.space?.name || '',
      timeRange: activity.timeRange || {
        startTime: '',
        endTime: '',
      },
      totalPrice: activity.price || {
        amount: 0,
        currency: 'CNY',
      },
      notice: '报名成功后如需取消，请提前联系主理人确认。',
    }
    this.setData({
      activity,
      order,
    })
  },
  onOpenMapTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const activity = (this.data as ConfirmOrderState).activity
    if (!activity) {
      return
    }

    const mapImages = activity.space?.mapImages || []
    if (mapImages && mapImages.length > 0) {
      wx.previewImage({
        current: mapImages[0],
        urls: mapImages,
      })
    } else {
      wx.showToast({
        title: '暂无地图信息',
        icon: 'none',
      })
    }
  },
  onSpaceDetailTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const activity = (this.data as ConfirmOrderState).activity
    if (!activity) {
      return
    }
    smartNavigateTo(
      `/pages/space/detail?id=${encodeURIComponent(String(activity.spaceId))}`
    )
  },
  onBackTap() {
    goBack()
  },
  onNameChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'order.participantName': e.detail.value,
    })
  },
  onPhoneChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'order.participantPhone': e.detail.value,
    })
  },
  async onSubmitTap(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const order = (this.data as ConfirmOrderState).order
    const activityIdRaw = order.activityId
    const activityId = Number(activityIdRaw)
    if (!Number.isFinite(activityId) || activityId <= 0) {
      wx.showToast({ title: '活动ID异常', icon: 'none' })
      return
    }

    wx.showLoading({ title: '报名中...', mask: true })
    try {
      const res = await createActivityOrder({
        activityId,
      })
      const bizOrderNo = res.bizOrderNo
      const amount = order.totalPrice.amount

      if (amount > 0) {
        const pay = await generatePayParams({ bizOrderNo, amount })
        const p = pay && pay.payParams
        if (!p) {
          wx.hideLoading()
          wx.showToast({ title: '支付参数缺失', icon: 'none' })
          return
        }

        wx.hideLoading()
        wx.requestPayment({
          timeStamp: p.timeStamp,
          nonceStr: p.nonceStr,
          package: p.packageData,
          signType: p.signType as any,
          paySign: p.paySign,
          success: () => {
            wx.showToast({ title: '报名成功', icon: 'success' })
            setTimeout(() => {
              smartNavigateTo(
                `/pages/activity-order/success?orderId=${encodeURIComponent(
                  bizOrderNo || String(order.id)
                )}`
              )
            }, 800)
          },
          fail: () => {
            wx.showToast({ title: '支付未完成', icon: 'none' })
          },
        } as any)
      } else {
        wx.hideLoading()
        wx.showToast({
          title: '报名成功',
          icon: 'success',
        })
        setTimeout(() => {
          smartNavigateTo(
            `/pages/activity-order/success?orderId=${encodeURIComponent(
              bizOrderNo || String(order.id)
            )}`
          )
        }, 800)
      }
    } catch (error) {
      wx.hideLoading()
      const msg = (error && (error as any).message) || '报名失败，请重试'
      wx.showToast({ title: msg, icon: 'none' })
      console.error(error)
    }
  },
})
