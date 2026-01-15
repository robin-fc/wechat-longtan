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
    const startDate = (options.startDate as string) || ''
    const duration = (options.duration as string) || ''

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

    let checkOutDate = ''
    if (duration) {
      const daysMap: Record<string, number> = {
        'week': 7,
        'twoWeeks': 14,
        'month': 30,
        'threeMonths': 90
      }
      const days = daysMap[duration] || 0
      if (days > 0) {
        // Handle date string format compatibility
        const start = new Date(checkInDate.replace(/-/g, '/'))
        if (!isNaN(start.getTime())) {
          const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000)
          const y = end.getFullYear()
          const m = String(end.getMonth() + 1).padStart(2, '0')
          const d = String(end.getDate()).padStart(2, '0')
          checkOutDate = `${y}-${m}-${d}`
        }
      }
    }

    this.setData({
      menuTop: menuRect ? menuRect.top : 0,
      menuHeight: menuRect ? menuRect.height : 44,
      homestayId,
      checkInDate,
      checkOutDate
    })
    
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
      const item = (list.rooms || []).find((x) => String(x.id) === String(id))
      if (!item) {
        return
      }
      const rawTags = item.tags
      const codes = (() => {
        if (Array.isArray(rawTags)) return rawTags.map((v) => String(v))
        const s = String(rawTags || '').trim()
        if (!s) return []
        if (s.startsWith('[') && s.endsWith(']')) {
          try {
            const arr = JSON.parse(s)
            if (Array.isArray(arr)) return arr.map((v) => String(v))
          } catch {}
        }
        return s.split(',')
      })()
        .map((v) => String(v).trim().replace(/^"+|"+$/g, ''))
        .filter(Boolean)

      const facilities = codes
        .map((code) => tagMap[code])
        .filter(Boolean)
      const duration = (item.roomNumber || '').split('-')[1] || '一周起'
      const room: HomestayRoom = {
        id: String(item.id),
        homestayId: String(homestayId),
        name: item.roomNumber,
        images: [{ id: `room-${item.id}`, url: item.logo }],
        description: '',
        stayDurationText: duration,
        price: { amount: item.price || 0, currency: 'CNY', unit: '天' },
        capacity: 2,
        facilities,
        attributes: [
          { label: '房型', value: '大床房' },
          { label: '面积', value: '20m²' },
          { label: '朝向', value: '东南' },
          { label: '卫生间', value: '独卫' },
          { label: '洗衣机', value: '洗烘套装' },
          { label: '花洒', value: '有' }
        ],
        tags: ['温馨', '硬件顶配', '免费wifi'],
        intro: '毫无疑问，动力电池是我们这个时代具有决定性的竞争优势之一：那些能够为电动汽车制造电池的国家和地区，将从中获得数十年的经济和地缘政治优势。而迄今为止，这一领域唯一的赢家就是中国。',
        notice: '毫无疑问，动力电池是我们这个时代具有决定性的竞争优势之一：那些能够为电动汽车制造电池的国家和地区，将从中获得数十年的经济和地缘政治优势。而迄今为止，这一领域唯一的赢家就是中国。',
        priceRule: '毫无疑问，动力电池是我们这个时代具有决定性的竞争优势之一：那些能够为电动汽车制造电池的国家和地区，将从中获得数十年的经济和地缘政治优势。而迄今为止，这一领域唯一的赢家就是中国。',
        checkInProcess: '毫无疑问，动力电池是我们这个时代具有决定性的竞争优势之一：那些能够为电动汽车制造电池的国家和地区，将从中获得数十年的经济和地缘政治优势。而迄今为止，这一领域唯一的赢家就是中国。'
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
        state.room && state.room.price
          ? state.room.price.amount
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
