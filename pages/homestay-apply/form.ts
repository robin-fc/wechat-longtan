import {
  fetchHomestayRoomDetail,
} from '../../api/homestay'
import type { HomestayRoom } from '../../model/homestay'
import { goBack, smartNavigateTo } from '../../utils/navigation'

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
  freeCancelDeadline: string
  form: ApplyForm
}

Page<ApplyFormState, WechatMiniprogram.IAnyObject>({
  data: {
    room: null,
    roomNameDisplay: '',
    checkInDate: '',
    checkOutDate: '',
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
    if (!roomId) {
      return
    }
    const room = await fetchHomestayRoomDetail(roomId)
    const display = `${room.name}`
    this.setData({
      room,
      roomNameDisplay: display,
    })
  },
  onBackTap() {
    goBack()
  },
  onCheckInChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    this.setData({
      checkInDate: e.detail.value,
    })
  },
  onCheckOutChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    this.setData({
      checkOutDate: e.detail.value,
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
    wx.showToast({
      title: '订单已创建，待支付',
      icon: 'success',
    })
    setTimeout(() => {
      smartNavigateTo('/pages/homestay-apply/status')
    }, 800)
  },
})
