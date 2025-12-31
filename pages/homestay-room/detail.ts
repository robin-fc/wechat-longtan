import { fetchHomestayRoomDetail, getAvailableRoomList } from '../../api/homestay'
import type { HomestayRoom } from '../../model/homestay'
import { formatYMD } from '../../utils/date'
import { goBack, smartNavigateTo } from '../../utils/navigation'

interface RoomDetailState {
  room: HomestayRoom | null
  checkInDate: string
  checkOutDate: string
  nights: number
  menuTop: number
  menuHeight: number
  totalPrice: number
  displayDateRange: string
}

Page<RoomDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    room: null,
    checkInDate: '',
    checkOutDate: '',
    nights: 0,
    menuTop: 0,
    menuHeight: 44,
    totalPrice: 0,
    displayDateRange: '',
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const id = options.id as string
    const homestayId = options.homestayId as string
    if (!id || !homestayId) {
      return
    }
    const menuRect = wx.getMenuButtonBoundingClientRect()
    this.setData({
      menuTop: menuRect ? menuRect.top : 0,
      menuHeight: menuRect ? menuRect.height : 44,
      homestayId,
    })
    
    const today = formatYMD(new Date())
    const rooms = await getAvailableRoomList(homestayId, today)
    const room = rooms.find(r => String(r.id) === id) || null
    
    this.setData({
      room,
    })
    this.updateNights()
  },
  onBackTap() {
    goBack()
  },
  onCheckInChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const date = e.detail.value
    this.setData(
      {
        checkInDate: date,
      },
      () => {
        this.updateNights()
      }
    )
  },
  onCheckOutChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const date = e.detail.value
    this.setData(
      {
        checkOutDate: date,
      },
      () => {
        this.updateNights()
      }
    )
  },
  updateNights(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const state = this.data as RoomDetailState
    if (!state.checkInDate || !state.checkOutDate) {
      this.setData({
        nights: 0,
        totalPrice: 0,
        displayDateRange: '',
      })
      return
    }
    const start = new Date(state.checkInDate).getTime()
    const end = new Date(state.checkOutDate).getTime()
    if (!isNaN(start) && !isNaN(end) && end > start) {
      const diff = end - start
      const nights = Math.round(diff / (24 * 60 * 60 * 1000))
      const amount =
        state.room && state.room.price && state.room.price
          ? state.room.price
          : 0
      const totalPrice = nights * amount
      const inDate = state.checkInDate
      const outDate = state.checkOutDate
      const displayDateRange =
        inDate && outDate
          ? `${inDate.slice(5)}至${outDate.slice(5)}`
          : ''
      this.setData({
        nights,
        totalPrice,
        displayDateRange,
      })
    } else {
      this.setData({
        nights: 0,
        totalPrice: 0,
        displayDateRange: '',
      })
    }
  },
  onApplyTap(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const state = this.data as RoomDetailState
    if (!state.room) {
      return
    }
    smartNavigateTo(
      `/pages/homestay-apply/form?roomId=${encodeURIComponent(state.room.id)}&homestayId=${encodeURIComponent(state.room.id)}`
    )
  },
})
