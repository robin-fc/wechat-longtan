import { getRoomDetail } from '../../api/room'
import { createAccommodationOrder, generatePayParams } from '../../api/order'
import type { HomestayRoom } from '../../model/homestay'
import { goBack, smartNavigateTo } from '../../utils/navigation'
import { formatYMD1 } from '../../utils/date'
import { isValidCnPhone } from '../../utils/validator'

interface ApplyForm {
  name: string
  idCard: string
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
  checkInDateDesc: string
  checkInWeekDesc: string
  checkOutDateDesc: string
  checkOutWeekDesc: string
  cancelDateDesc: string
  isFormValid: boolean
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
    freeCancelDeadline: '入住日期7天前退款扣除30%,7天内不退款',
    checkInDateDesc: '',
    checkInWeekDesc: '',
    checkOutDateDesc: '',
    checkOutWeekDesc: '',

    cancelDateDesc: '',
    isFormValid: false,
    form: {
      name: '',
      idCard: '',
      phone: '',
    },
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const roomId = options.roomId as string
    const homestayId = options.homestayId as string
    const startDate = options.startDate as string
    const duration = parseInt(options.duration as string, 10) || 1
    const packageType = options.packageType as string
    console.log(options)
    if (!roomId || !homestayId) {
      return
    }

    let checkInDate = startDate || formatYMD1(new Date(), '-')
    let checkOutDate = ''
    if (checkInDate) {
      const start = new Date(checkInDate.replace(/-/g, '/'))
      const end = new Date(start)
      end.setDate(start.getDate() + duration)
      checkOutDate = formatYMD1(end, '-')
    }

    this.setData({
      checkInDate,
      checkOutDate,
      nightsCount: duration
    })
    this.updateDateDisplays()


    const res = await getRoomDetail({ id: Number(roomId) })

    // 根据 packageType 从 phasePrice 中获取对应价格
    let roomPrice = res.price || 0
    if (packageType && res.phasePrice && res.phasePrice.length > 0) {
      const packageTypeNum = Number(packageType)
      const priceItem = res.phasePrice.find(p => p.packageType === packageTypeNum)
      if (priceItem) {
        roomPrice = priceItem.price
      }
    }

    const room: HomestayRoom = {
      id: String(res.id),
      homestayId: String(res.homestayId),
      name: res.roomNumber,
      images: (res.photos || []).map((url, index) => ({ id: `p-${index}`, url })),
      description: res.description,
      stayDurationText: '',
      price: { amount: roomPrice, currency: 'CNY', unit: '天' },
      capacity: 2,
      facilities: res.tags,
      tags: res.tags,

      bookingNotice: res.bookNotice,
      priceRule: res.priceRule,
      checkInProcess: res.checkInProcess
    }

    if (!room) return
    const display = `${res.homestayName}-${room.name}-${duration === 7
      ? '一周'
      : duration === 14
        ? '两周'
        : duration === 30
          ? '一月'
          : duration === 90
            ? '三月'
            : ''
      }`
    // phasePrice 中的价格已经是总包价格，不需要乘以天数
    const totalPrice = room.price?.amount || 0
    this.setData({
      room,
      roomNameDisplay: display,
      totalPrice: totalPrice,
      totalPriceDisplay: totalPrice.toFixed(2),
    })

  },
  updateDateDisplays() {
    const data = this.data as ApplyFormState
    const fmtStart = this.formatDateInfo(data.checkInDate)
    const fmtEnd = this.formatDateInfo(data.checkOutDate)

    let cancelDesc = ''
    if (data.checkInDate) {
      const start = new Date(data.checkInDate.replace(/-/g, '/'))
      // Cancel free 7 days before
      const cancelDate = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000)
      const cM = cancelDate.getMonth() + 1
      const cD = cancelDate.getDate()
      cancelDesc = `${cM}月${cD}日`
    }

    this.setData({
      checkInDateDesc: fmtStart.date,
      checkInWeekDesc: fmtStart.week,
      checkOutDateDesc: fmtEnd.date,
      checkOutWeekDesc: fmtEnd.week,
      cancelDateDesc: cancelDesc,
    })
  },
  formatDateInfo(dateStr: string) {
    if (!dateStr) return { date: '', week: '' }
    const date = new Date(dateStr.replace(/-/g, '/'))
    if (isNaN(date.getTime())) return { date: '', week: '' }
    const m = date.getMonth() + 1
    const d = date.getDate()
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const week = weekDays[date.getDay()]
    return { date: `${m}月${d}日`, week }
  },
  onBackTap() {
    goBack()
  },
  onCheckInChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const inDate = e.detail.value as string
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
    // phasePrice 中的价格已经是总包价格，不需要乘以天数
    const total = room ? room.price.amount : 0
    this.setData({
      nightsCount: nights,
      totalPrice: total,
      totalPriceDisplay: (Number.isFinite(total) ? total : 0).toFixed(2),
    })
    this.updateDateDisplays()
  },
  onCheckOutChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const outDate = e.detail.value as string
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
    // phasePrice 中的价格已经是总包价格，不需要乘以天数
    const total = room ? room.price.amount : 0
    this.setData({
      nightsCount: nights,
      totalPrice: total,
      totalPriceDisplay: (Number.isFinite(total) ? total : 0).toFixed(2),
    })
    this.updateDateDisplays()
  },
  onNameChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'form.name': e.detail.value,
    }, () => {
      this.validateForm()
    })
  },
  onIdCardChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'form.idCard': e.detail.value,
    }, () => {
      this.validateForm()
    })
  },
  onPhoneChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      'form.phone': e.detail.value,
    }, () => {
      this.validateForm()
    })
  },
  validateForm() {
    const form = (this.data as ApplyFormState).form
    const isValid = !!(form.name && form.idCard && form.phone)
    this.setData({
      isFormValid: isValid
    })
  },
  onSubmitTap(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const state = this.data as ApplyFormState
    debugger
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
    if (!isValidCnPhone(form.phone.trim())) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none',
      })
      return
    }
    if (!state.isFormValid) {
      return
    }
    const params = {
      roomId: Number(state.room.id),
      checkInDate: state.checkInDate + 'T00:00:00.00Z',
      checkOutDate: state.checkOutDate + 'T00:00:00.00Z',
      contactName: form.name.trim(),
      contactIdCard: form.idCard.trim(),
      contactPhone: form.phone.trim(),
      packagePrice: state.totalPrice,
    }
    wx.showLoading({ title: '创建订单中...', mask: true })
    createAccommodationOrder(params)
      .then(async (res) => {
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

          const amount = Number(((this.data as ApplyFormState).totalPrice || 0).toFixed(2))
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
              // setTimeout(() => {
              //   smartNavigateTo('/pages/homestay-apply/status')
              // }, 600)
              setTimeout(() => {
                smartNavigateTo(`/pages/order/detail?bizOrderNo=${encodeURIComponent(bizOrderNo)}`)
              }, 600)
            },
            fail: () => {
              wx.showToast({ title: '支付未完成', icon: 'none' })
              setTimeout(() => {
                smartNavigateTo(`/pages/order/detail?bizOrderNo=${encodeURIComponent(bizOrderNo)}`)
              }, 600)
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
