import {
  getHomestayDetailApi,
  getHomestayAvailableRooms,
} from '../../api/homestay'
import type { Homestay, HomestayRoom } from '../../model/homestay'
import { goBack, smartNavigateTo } from '../../utils/navigation'

type DurationType = 'week' | 'twoWeeks' | 'month' | 'threeMonths'

interface DurationOption {
  label: string
  value: DurationType
}

interface HomestayDetailState {
  homestay: Homestay | null
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
  const duration = (item.roomNumberWithPackage || '').split('-')[1] || ''
  const facilities = String(item.tags || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean)
    .map((code: string) => tagMap[code])
    .filter(Boolean)

  return {
    id: String(item.id),
    homestayId: String(homestayId),
    name: item.roomNumberWithPackage,
    images: [{ id: `room-${item.id}`, url: item.logo }],
    description: '',
    stayDurationText: duration || '一周起',
    price: { amount: item.price, currency: 'CNY', unit: '天' },
    capacity: 2,
    facilities,
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
      const detail = await getHomestayDetailApi(Number(id))
      const coverUrl = (() => {
        try {
          const arr = JSON.parse(detail.images || '[]')
          if (Array.isArray(arr) && arr.length && typeof arr[0] === 'string') {
            return arr[0]
          }
        } catch {}
        return detail.logo || ''
      })()

      // Construct homestay object from detail
      const homestay: Homestay = {
        id: detail.id,
        name: detail.name,
        cover: { id: `homestay-${detail.id}-cover`, url: coverUrl },
        address: detail.address,
        featureTags: [],
        minPrice: 0,
        mapImages: [],
        reservedUsers: [],
        description: detail.description,
      }

      const now = new Date()
      const yyyy = String(now.getFullYear())
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const startDate = `${yyyy}-${mm}-${dd}`
      this.setData({
        homestay,
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
        homestayId: String(detail.id),
        checkInDate: startDate,
      })
      const rooms: HomestayRoom[] = (roomList || []).map((item) =>
        mapApiRoomToHomestayRoom(item, detail.id, tagMap)
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
    const homestay = this.data.homestay as Homestay | null
    if (homestay && homestay.coordinates) {
      wx.openLocation({
        latitude: homestay.coordinates.latitude,
        longitude: homestay.coordinates.longitude,
        name: homestay.name,
        address: homestay.address,
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
    const tagMap: Record<string, string> = {
      '0': '独立卫生间',
      '1': '山景房',
      '2': '海景房',
      '3': '家庭房',
      '4': '双床房',
      '5': '大床房',
    }
    getHomestayAvailableRooms({
      homestayId: String(homestay.id),
      checkInDate: startDate as string,
    }).then((roomList) => {
      const rooms: HomestayRoom[] = (roomList || []).map((item) =>
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
      )}&startDate=${encodeURIComponent(startDate)}&duration=${encodeURIComponent(
        duration
      )}`
    )
  },
})
