import { getActivityDetail } from '../../api/activity'
import { createActivityOrder, generatePayParams } from '../../api/order'
import { type Activity } from '../../model/activity'
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
    const activity = await  getActivityDetail(id)
    if (!activity) return
    const order: ActivityOrder = {
      ...emptyOrder,
      id: `order-${Date.now()}`,
      activityId: activity.id,
      title: activity.title,
      totalPrice: activity.isFree
        ? { amount: 0, currency: 'CNY' }
        : { amount: activity.fee, currency: 'CNY' },
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

    // todo
    const mapImages = [activity.logo]
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
  async onSubmitTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const order = (this.data as ConfirmOrderState).order
    console.log('活动订单order', order)
    const activityIdRaw = order.activityId
    const activityId = Number(activityIdRaw)
    if (!Number.isFinite(activityId) || activityId <= 0) {
      wx.showToast({ title: '活动ID异常', icon: 'none' })
      return
    }

    const activity = (this.data as ConfirmOrderState).activity

    console.log('活动订单activity', activity)
    if (activity && activity.auditStatus !== '审核通过') {
      let msg = '该活动未审核通过，无法报名'
      if (activity.auditStatus === '待审核') {
        msg = '该活动正在审核中，暂时无法报名'
      } else if (activity.auditStatus === '审核不通过') {
        msg = '该活动审核不通过，无法报名'
      }
      wx.showModal({
        title: '提示',
        content: msg,
        showCancel: false,
      })
      return
    }

    if (activity && activity.activityStatus === '已结束') {
      wx.showModal({
        title: '提示',
        content: '该活动已结束，无法报名',
        showCancel: false,
      })
      return
    }

    wx.showLoading({ title: '报名中...', mask: true })
    try {
      const res = await createActivityOrder({
        activityId,
      })
      const bizOrderNo = res.bizOrderNo
      const amount = order.totalPrice.amount
      console.log('活动订单amount', amount)
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
        // todo  免费活动的逻辑需要修改，目前是直接跳转成功页
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
