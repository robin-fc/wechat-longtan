import { getAvailableRoomList } from '../../api/homestay'
import { createAccommodationOrder, generatePayParams } from '../../api/order'
import type { HomestayRoom } from '../../model/homestay'
import { goBack, smartNavigateTo } from '../../utils/navigation'
import { formatYMD1 } from '../../utils/date'

interface ApplyForm {
  name: string
  idCard: string
  wechatId: string
  phone: string
}

interface ApplyFormState {
  room: HomestayRoom | null
  roomNameDisplay: string
  checkInDate: string
  checkOutDate: string
  nightsCount: number
  totalPrice: number
  totalPriceDisplay: string
  freeCancelDeadline: string
  form: ApplyForm
}

Page<ApplyFormState, WechatMiniprogram.IAnyObject>({
  data: {
    room: null,
    roomNameDisplay: '',
    checkInDate: '',
    checkOutDate: '',
    nightsCount: 1,
    totalPrice: 0,
    totalPriceDisplay: '0.00',
    freeCancelDeadline: '下单后24小时内可免费取消',
    form: {
      name: '',
      idCard: '',
      wechatId: '',
      phone: '',
    },
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const roomId = options.roomId as string
    const homestayId = options.homestayId as string
    if (!roomId || !homestayId) {
      return
    }
    const today = formatYMD1(new Date(),'-');
    const rooms = await getAvailableRoomList(homestayId, today)
    const room = rooms.find(r => String(r.id) === roomId)
    if (!room) return

    const display = `${room.name}`
    this.setData({
      room,
      roomNameDisplay: display,
      totalPrice: room.price.amount,
      totalPriceDisplay: (room.price.amount || 0).toFixed(2),
    })
  },
  onBackTap() {
    goBack()
  },
  onCheckInChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const inDate = e.detail.value
    const outDate = (this.data as ApplyFormState).checkOutDate
    if (outDate) {
      const inTs = new Date(inDate).getTime()
      const outTs = new Date(outDate).getTime()
      if (outTs < inTs) {
        wx.showToast({
          title: '离店日期不能早于入住日期',
          icon: 'none',
        })
        return
      }
    }
    this.setData({ checkInDate: inDate })
    const nights = inDate && outDate ? Math.max(1, Math.ceil((new Date(outDate).getTime() - new Date(inDate).getTime()) / (24 * 60 * 60 * 1000))) : 1
    const room = (this.data as ApplyFormState).room
    const amount = room ? room.price.amount : 0
    const total = amount * nights
    this.setData({
      nightsCount: nights,
      totalPrice: total,
      totalPriceDisplay: (Number.isFinite(total) ? total : 0).toFixed(2),
    })
  },
  onCheckOutChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const outDate = e.detail.value
    const inDate = (this.data as ApplyFormState).checkInDate
    if (inDate) {
      const inTs = new Date(inDate).getTime()
      const outTs = new Date(outDate).getTime()
      if (outTs < inTs) {
        wx.showToast({
          title: '离店日期不能早于入住日期',
          icon: 'none',
        })
        return
      }
    }
    this.setData({ checkOutDate: outDate })
    const nights = inDate && outDate ? Math.max(1, Math.ceil((new Date(outDate).getTime() - new Date(inDate).getTime()) / (24 * 60 * 60 * 1000))) : 1
    const room = (this.data as ApplyFormState).room
    const amount = room ? room.price.amount : 0
    const total = amount * nights
    this.setData({
      nightsCount: nights,
      totalPrice: total,
      totalPriceDisplay: (Number.isFinite(total) ? total : 0).toFixed(2),
    })
  },
  onNameChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'form.name': e.detail.value,
    })
  },
  onIdCardChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'form.idCard': e.detail.value,
    })
  },
  onWechatChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'form.wechatId': e.detail.value,
    })
  },
  onPhoneChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'form.phone': e.detail.value,
    })
  },
  onSubmitTap(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const state = this.data as ApplyFormState
    if (!state.room) {
      return
    }
    if (!state.checkInDate || !state.checkOutDate) {
      wx.showToast({
        title: '请选择入离日期',
        icon: 'none',
      })
      return
    }
    const form = state.form
    if (!form.name.trim()) {
      wx.showToast({
        title: '请填写姓名',
        icon: 'none',
      })
      return
    }
    if (!form.idCard.trim()) {
      wx.showToast({
        title: '请填写身份证',
        icon: 'none',
      })
      return
    }
    if (!form.wechatId.trim()) {
      wx.showToast({
        title: '请填写微信号',
        icon: 'none',
      })
      return
    }
    if (!form.phone.trim()) {
      wx.showToast({
        title: '请填写手机号',
        icon: 'none',
      })
      return
    }
    const params = {
      roomId: Number(state.room.id),
      checkInDate: state.checkInDate+'T00:00:00.00Z',
      checkOutDate: state.checkOutDate+'T00:00:00.00Z',
      contactName: form.name.trim(),
      contactIdCard: form.idCard.trim(),
      contactWechat: form.wechatId.trim(),
      contactPhone: form.phone.trim(),
    }
    wx.showLoading({ title: '创建订单中...', mask: true })
    createAccommodationOrder(params)
      .then(async (res) => {
        console.log('createAccommodationOrder res=', res)
        if (res.code !== 0) {
          wx.hideLoading()
          if (res.code === 1001003004) {
            wx.showToast({
              title: res?.msg || '最少需要入住7天',
              icon: 'none',
              duration: 2000,
              mask: true,
            })
          } else {
            wx.showToast({
              title: res?.msg || '创建订单失败',
              icon: 'none',
              duration: 2000,
              mask: true,
            })
          }
          return
        }
        const bizOrderNo = res.data?.bizOrderNo
        if (!bizOrderNo) {
          wx.hideLoading()
          wx.showToast({ title: '订单号缺失', icon: 'none' })
          return
        }
        try {
          // const amount = (this.data as ApplyFormState).totalPrice || 0
          const amount = 0.1
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
              wx.showToast({ title: '支付成功', icon: 'success' })
              setTimeout(() => {
                smartNavigateTo('/pages/homestay-apply/status')
              }, 600)
            },
            fail: () => {
              wx.showToast({ title: '支付未完成', icon: 'none' })
            },
          } as any)
        } catch (e) {
          wx.hideLoading()
          wx.showToast({ title: '拉起支付失败', icon: 'none' })
        }
      })
      .catch((err) => {
        wx.hideLoading()
        wx.showModal({
          title: '创建失败',
          content: (err && err.message) || '网络错误，请稍后再试',
          showCancel: false,
        })
      })
  },
})
