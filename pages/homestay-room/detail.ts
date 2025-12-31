import { getHomestayAvailableRooms } from '../../api/homestay'
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
    const now = new Date()
    const yyyy = String(now.getFullYear())
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const checkInDate = `${yyyy}-${mm}-${dd}`
    this.setData({ checkInDate })
    await this.fetchRoomDetail(homestayId, id, checkInDate)
    this.updateNights()
  },
  async fetchRoomDetail(
    this: WechatMiniprogram.Page.TrivialInstance,
    homestayId: string,
    id: string,
    checkInDate: string
  ) {
    const tagMap: Record<string, string> = {
      '0': '独立卫生间',
      '1': '山景房',
      '2': '海景房',
      '3': '家庭房',
      '4': '双床房',
      '5': '大床房',
    }
    try {
      const list = await getHomestayAvailableRooms({ homestayId, checkInDate })
      const item = (list || []).find((x) => String(x.id) === String(id))
      if (!item) {
        return
      }
      const facilities = (item.tags || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((code) => tagMap[code])
        .filter(Boolean)
      const duration = (item.roomNumberWithPackage || '').split('-')[1] || '一周起'
      const room: HomestayRoom = {
        id: String(item.id),
        homestayId: String(homestayId),
        name: item.roomNumberWithPackage,
        images: [{ id: `room-${item.id}`, url: item.logo }],
        description: '',
        stayDurationText: duration,
        price: { amount: item.price || 0, currency: 'CNY', unit: '晚' },
        capacity: 2,
        facilities,
      }
      this.setData({ room })
    } catch {}
  },
  onBackTap() {
    goBack()
  },
  onCheckInChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const date = e.detail.value
    const state = this.data as RoomDetailState
    const room = state.room
    const homestayId = room ? String(room.homestayId) : ''
    this.setData({ checkInDate: date })
    if (homestayId && room) {
      this.fetchRoomDetail(homestayId, String(room.id), date).then(() => {
        this.updateNights()
      })
    } else {
      this.updateNights()
    }
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
