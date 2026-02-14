import { getActivityDetail } from '../../api/activity'
import { fetchMyProfile } from '../../api/mine'
import { updateUserInfo } from '../../api/user'
import { createActivityOrder, generatePayParams } from '../../api/order'
import { type Activity } from '../../model/activity'
import type { ActivityOrder } from '../../model/order'
import { goBack, smartNavigateTo } from '../../utils/navigation'

interface ConfirmOrderState {
  activity: Activity | null
  order: ActivityOrder
  contactName: string
  contactPhone: string
  showPhoneAuthModal: boolean
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
    contactName: '',
    contactPhone: '',
    showPhoneAuthModal: false,
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
    const activity = await getActivityDetail(id)
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

    // Auto-fill from storage if available
    const userInfo = wx.getStorageSync('userInfo')
    let contactName = ''
    let contactPhone = ''
    if (userInfo) {
      // Try to make a best guess or leave empty if structure unknown
      // Assuming simplistic structure for now
      contactName = userInfo.nickName || ''
    }

    this.setData({
      activity,
      order,
      contactName,
      contactPhone,
    })

    this.checkUserStatus()
  },

  async checkUserStatus() {
    const accessToken = wx.getStorageSync('accessToken')
    if (!accessToken) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => {
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]
        const options = currentPage.options
        const returnUrl = `/${currentPage.route}?activityId=${options.activityId}`
        smartNavigateTo(`/pages/login/index?returnUrl=${encodeURIComponent(returnUrl)}`)
      }, 1000)
      return
    }

    try {
      const profile = await fetchMyProfile()
      if (profile) {
        if (!profile.memberPhone) {
          setTimeout(() => {
            this.setData({ showPhoneAuthModal: true })
          }, 1000)
        } else {
          // Auto-fill phone if available
          this.setData({
            contactPhone: profile.memberPhone
          })
        }

        // Auto-fill name if available and empty
        if (!this.data.contactName) {
          this.setData({
            contactName: profile.memberName || profile.wxName || ''
          })
        }
      }
    } catch (e) {
      console.error('Fetch profile failed', e)
    }
  },

  closePhoneAuthModal() {
    this.setData({ showPhoneAuthModal: false })
  },

  async onPhoneAuthSuccess(e: any) {
    const { phone } = e.detail
    this.setData({ showPhoneAuthModal: false })

    // Update user info with phone number
    if (phone && phone.phoneNumber) {
      try {
        await updateUserInfo({
          memberPhone: phone.phoneNumber
        })
        wx.showToast({ title: '绑定成功', icon: 'success' })
        this.setData({
          contactPhone: phone.phoneNumber
        })
      } catch (error) {
        console.error('Failed to update phone number', error)
        wx.showToast({ title: '更新手机号失败', icon: 'none' })
      }
    } else {
      wx.showToast({ title: '绑定成功', icon: 'success' })
    }
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
  onNameChange(e: WechatMiniprogram.Input) {
    this.setData({
      contactName: e.detail.value
    })
  },
  onPhoneChange(e: WechatMiniprogram.Input) {
    this.setData({
      contactPhone: e.detail.value
    })
  },

  async onSubmitTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const state = this.data as ConfirmOrderState
    const order = state.order
    console.log('活动订单order', order)
    const activityIdRaw = order.activityId
    const activityId = Number(activityIdRaw)
    if (!Number.isFinite(activityId) || activityId <= 0) {
      wx.showToast({ title: '活动ID异常', icon: 'none' })
      return
    }

    const activity = state.activity
    const contactName = state.contactName.trim()
    const contactPhone = state.contactPhone.trim()

    if (!contactName) {
      wx.showToast({ title: '请填写称谓', icon: 'none' })
      return
    }


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
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
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
        contactName,
        contactPhone
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
