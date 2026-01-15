import {
  getHomestayDetailApi,
  getHomestayAvailableRooms,
} from '../../api/homestay'
import { tagMap, type AppHomestayDetail, type HomestayRoom, HOMESTAY_TAGS } from '../../model/homestay'
import { goBack, smartNavigateTo } from '../../utils/navigation'

type DurationType = 'week' | 'twoWeeks' | 'month' | 'threeMonths'

interface DurationOption {
  label: string
  value: DurationType
}

interface HomestayDetailState {
  homestay: AppHomestayDetail | null
  rooms: HomestayRoom[]
  startDate: string
  duration: DurationType
  durations: DurationOption[]
  menuTop: number
  menuHeight: number
  isDescriptionExpanded: boolean
}

// Helper to map API room response to HomestayRoom
const mapApiRoomToHomestayRoom = (
  item: any,
  homestayId: number,
  tagMap: Record<string, string>
): HomestayRoom => {
  const duration = (item.roomNumber || '').split('-')[1] || ''
  const facilities = String(item.tags || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean)
    .map((code: string) => tagMap[code])
    .filter(Boolean)

  return {
    id: String(item.id),
    homestayId: String(homestayId),
    name: item.roomNumber,
    images: [{ id: `room-${item.id}`, url: item.logo }],
    description: item.description || '',
    stayDurationText: duration || '一周起',
    price: { amount: item.price, currency: 'CNY', unit: '天' },
    capacity: 2,
    facilities,
    stayedUsers: item.stayedUsers || [],
  }
}

Page<HomestayDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    homestay: null,
    rooms: [],
    startDate: '',
    duration: 'week',
    durations: [
      { label: '一周', value: 'week' },
      { label: '两周', value: 'twoWeeks' },
      { label: '一个月', value: 'month' },
      { label: '三个月', value: 'threeMonths' },
    ],
    menuTop: 0,
    menuHeight: 44,
    isDescriptionExpanded: false,
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const id = options.id as string
    if (!id) {
      return
    }
    const menuRect = wx.getMenuButtonBoundingClientRect()
    this.setData({
      menuTop: menuRect ? menuRect.top : 0,
      menuHeight: menuRect ? menuRect.height : 44,
    })
    try {
      const homestayDetail = await getHomestayDetailApi(Number(id))
      
      // Map tags from numbers to strings
      if (homestayDetail.tags && Array.isArray(homestayDetail.tags)) {
        homestayDetail.tags = homestayDetail.tags.map(t => HOMESTAY_TAGS[Number(t)] || t)
      }

      const now = new Date()
      const yyyy = String(now.getFullYear())
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const startDate = `${yyyy}-${mm}-${dd}`
      this.setData({
        homestay: homestayDetail,
        startDate: startDate,
      })
      const tagMap: Record<string, string> = {
        '0': '独立卫生间',
        '1': '山景房',
        '2': '海景房',
        '3': '家庭房',
        '4': '双床房',
        '5': '大床房',
      }
      const roomList = await getHomestayAvailableRooms({
        homestayId: String(homestayDetail.id),
        checkInDate: startDate,
      })
      const rooms: HomestayRoom[] = (roomList.rooms || []).map((item) =>
        mapApiRoomToHomestayRoom(item, homestayDetail.id, tagMap)
      )
      this.setData({
        rooms,
      })
    } catch (e) {
      // ignore for now
    }
  },
  onBackTap() {
    goBack()
  },
  toggleDescription(this: WechatMiniprogram.Page.TrivialInstance) {
    this.setData({
      isDescriptionExpanded: !this.data.isDescriptionExpanded,
    })
  },
  onOpenMap(this: WechatMiniprogram.Page.TrivialInstance) {
    const homestay = this.data.homestay as AppHomestayDetail | null
    if (homestay && homestay.mapImages && homestay.mapImages.length > 0) {
      wx.previewImage({
        urls: homestay.mapImages,
        current: homestay.mapImages[0],
      })
    }
  },
  onStartDateChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    const startDate = e.detail.value
    this.setData({ startDate })
    const data = this.data as HomestayDetailState
    const homestay = data.homestay
    if (!homestay) {
      return
    }
    
    getHomestayAvailableRooms({
      homestayId: String(homestay.id),
      checkInDate: startDate as string,
    }).then((roomList) => {
      const rooms: HomestayRoom[] = (roomList.rooms || []).map((item) =>
        mapApiRoomToHomestayRoom(item, homestay.id, tagMap)
      )
      this.setData({ rooms })
    })
  },
  onDurationTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const value = e.currentTarget.dataset.value as DurationType
    this.setData({
      duration: value,
    })
  },
  onRoomTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    _e: WechatMiniprogram.CustomEvent
  ) {
    const room = (_e.detail || {}).room as {
      id?: string
      homestayId?: string
    }
    if (!room || !room.id) {
      return
    }
    const { startDate, duration } = this.data as HomestayDetailState
    smartNavigateTo(
      `/pages/homestay-room/detail?id=${encodeURIComponent(
        room.id
      )}&homestayId=${encodeURIComponent(
        room.homestayId || ''
      )}&startDate=${encodeURIComponent(
        startDate
      )}&duration=${encodeURIComponent(duration)}`
    )
  },
})
