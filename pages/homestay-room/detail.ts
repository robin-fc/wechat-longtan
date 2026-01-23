import { getRoomDetail } from '../../api/room'
import type { HomestayRoom } from '../../model/homestay'
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
    const startDate = (options.startDate as string) || ''
    const duration = (options.duration as string) || ''
    const checkOutDateOption = (options.checkOutDate as string) || ''
    if (!id || !homestayId) {
      return
    }
    const menuRect = wx.getMenuButtonBoundingClientRect()

    let checkInDate = startDate
    if (!checkInDate) {
      const now = new Date()
      const yyyy = String(now.getFullYear())
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      checkInDate = `${yyyy}-${mm}-${dd}`
    }

    let checkOutDate = checkOutDateOption
    if (duration) {
      const daysMap: Record<string, number> = {
        week: 7,
        twoWeeks: 14,
        month: 30,
        threeMonths: 90,
        '1': 7,
      }
      const days = daysMap[duration] || 0
      if (days > 0) {
        // Handle date string format compatibility
        const start = new Date(checkInDate.replace(/-/g, '/'))
        if (!isNaN(start.getTime())) {
          const end = new Date(start)
          end.setDate(start.getDate() + days)
          const y = end.getFullYear()
          const m = String(end.getMonth() + 1).padStart(2, '0')
          const d = String(end.getDate()).padStart(2, '0')
          checkOutDate = `${y}-${m}-${d}`
        }
      }
    }

    console.log(checkInDate, checkOutDate, duration)
    this.setData({
      menuTop: menuRect ? menuRect.top : 0,
      menuHeight: menuRect ? menuRect.height : 44,
      homestayId,
      checkInDate,
      checkOutDate,
    })

    await this.fetchRoomDetail(homestayId, id)
    this.updateNights()
  },
  async fetchRoomDetail(
    homestayId: string,
    id: string
  ) {
    try {
      const res = await getRoomDetail({ id: Number(id) })

      const duration = (res.roomNumber || '').split('-')[1] || '一周起'

      // Map API response to HomestayRoom model
      const room: HomestayRoom = {
        id: String(res.id),
        homestayId: homestayId,
        name: res.roomNumber,
        images: (res.photos || []).map((url, index) => ({
          id: `photo-${index}`,
          url,
        })),
        description: res.description, // API currently doesn't provide description
        stayDurationText: duration,
        bookingNotice: res.bookNotice || '',
        priceRule: res.priceRule || '',
        checkInProcess: res.checkInProcess || '',
        price: { amount: res.price || 0, currency: 'CNY', unit: '天' },
        capacity: 2,
        facilities: res.tags || [],
        attributes: Array.isArray(res.attributes) ? res.attributes : [],
        tags: res.tags || []
      }

      // Fallback for images if photos are empty
      if (room.images.length === 0 && res.logo) {
        room.images = [{ id: 'logo', url: res.logo }]
      }

      this.setData({ room })
    } catch (e) {
      console.error('Fetch room detail failed:', e)
    }
  },
  onBackTap() {
    goBack()
  },
  onCheckInChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const date = e.detail.value
    this.setData({ checkInDate: date }, () => {
      this.updateNights()
    })
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
  updateNights(this: WechatMiniprogram.Page.TrivialInstance) {
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
        state.room && state.room.price ? state.room.price.amount : 0
      const totalPrice = nights * amount
      const inDate = state.checkInDate
      const outDate = state.checkOutDate
      const displayDateRange =
        inDate && outDate ? `${inDate.slice(5)}至${outDate.slice(5)}` : ''
      this.setData({
        nights,
        totalPrice,
        displayDateRange,
      })
      console.log(nights,
        totalPrice,
        displayDateRange,)
    } else {
      this.setData({
        nights: 0,
        totalPrice: 0,
        displayDateRange: '',
      })
    }
  },
  onApplyTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const state = this.data as RoomDetailState
    if (!state.room) {
      return
    }
    smartNavigateTo(
      `/pages/homestay-apply/form?roomId=${encodeURIComponent(
        state.room.id
      )}&homestayId=${encodeURIComponent(
        state.room.homestayId
      )}&startDate=${encodeURIComponent(
        state.checkInDate
      )}&duration=${encodeURIComponent(String(state.nights))}`
    )
  },
})
