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

// Helper to map API room response to HomestayRoom with mocked fields
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
    // Mock missing fields
    attributes: [
      { label: '房型', value: '大床' },
      { label: '面积', value: '35m²' },
      { label: '楼层', value: '一楼' },
      { label: '设施', value: '独立卫浴' },
    ],
    tags: ['连住优惠', '超赞房东'],
    guestAvatars: [
      'https://picsum.photos/50/50?random=1',
      'https://picsum.photos/50/50?random=2',
    ],
    guestCount: 12,
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

      // Mock missing fields
      const homestay: Homestay = {
        id: detail.id,
        name: detail.name,
        cover: { id: `homestay-${detail.id}-cover`, url: coverUrl },
        address: detail.address,
        featureTags: [
          { id: 1, name: '古镇中心' },
          { id: 2, name: '河景' },
          { id: 3, name: '设计师民宿' },
        ],
        minPrice: 0,
        mapImages: [],
        reservedUsers: [],
        description:
          detail.description ||
          '位于福建宁德屏南县龙潭古镇，这里的建筑融合了江南古镇和闽东特色，黄墙黛瓦，木质结构的房屋依山傍水。你可以在此沉浸式感受原汁原味的乡村生活，体验小桥流水的宁静，还能穿着...',
        roomCount: 3,
        mapThumbnail: { id: 'map', url: 'https://picsum.photos/400/200' },
        coordinates: { latitude: 26.9, longitude: 119.0 },
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
