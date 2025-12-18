import { fetchActivityDetail } from '../../api/activity'
import { createActivityOrder } from '../../api/order'
import type { Activity } from '../../model/activity'
import type { ActivityOrder } from '../../model/order'
import { goBack, smartNavigateTo } from '../../utils/navigation'

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

Page<ConfirmOrderState>({
  data: {
    activity: null,
    order: emptyOrder,
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
    const order: ActivityOrder = {
      ...emptyOrder,
      id: `order-${Date.now()}`,
      activityId: activity.id,
      title: activity.title,
      spaceName: activity.space.name,
      timeRange: activity.timeRange,
      totalPrice: activity.price,
      notice: '报名成功后如需取消，请提前联系主理人确认。',
    }
    this.setData({
      activity,
      order,
    })
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
    if (!order.participantName.trim()) {
      wx.showToast({
        title: '请填写参与者姓名',
        icon: 'none',
      })
      return
    }
    if (!order.participantPhone.trim()) {
      wx.showToast({
        title: '请填写联系方式',
        icon: 'none',
      })
      return
    }
    await createActivityOrder(order)
    wx.showToast({
      title: '报名成功',
      icon: 'success',
    })
    setTimeout(() => {
      smartNavigateTo(
        `/pages/activity-order/success?orderId=${encodeURIComponent(
          order.id
        )}`
      )
    }, 800)
  },
})

