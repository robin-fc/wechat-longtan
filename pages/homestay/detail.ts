import {
  getHomestayDetailApi,
  getHomestayAvailableRooms,
  getHomestayPackageList,
} from '../../api/homestay'
import {
  AppHomestayDetail,
  HOMESTAY_TAGS,
  AppHomestayPackageItem,
  AppHomestayRoomListItem,
} from '../../model/homestay'
import { goBack, smartNavigateTo } from '../../utils/navigation'

interface DurationOption {
  label: string
  value: string
  days: number
}

interface HomestayDetailState {
  homestay: AppHomestayDetail | null
  rooms: AppHomestayRoomListItem[]
  startDate: string
  endDate: string
  duration: string
  durations: DurationOption[]
  menuTop: number
  menuHeight: number
  isDescriptionExpanded: boolean
  showExpandBtn: boolean
}

function calcEndDate(startDate: string, days: number): string {
  const parts = (startDate || '').split('-')
  if (parts.length !== 3) {
    return startDate
  }
  const year = Number(parts[0])
  const month = Number(parts[1]) - 1
  const day = Number(parts[2])
  const dt = new Date(year, month, day)
  dt.setDate(dt.getDate() + days)
  const yyyy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

Page<HomestayDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    homestay: null,
    rooms: [],
    startDate: '',
    endDate: '',
    duration: '',
    durations: [],
    menuTop: 0,
    menuHeight: 44,
    isDescriptionExpanded: false,
    showExpandBtn: false,
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
        homestayDetail.tags = homestayDetail.tags.map(
          (t) => HOMESTAY_TAGS[Number(t)] || t
        )
      }

      const now = new Date()
      const yyyy = String(now.getFullYear())
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const startDate = `${yyyy}-${mm}-${dd}`

      const packages = await getHomestayPackageList()
      const durations: DurationOption[] = (packages || []).map(
        (item: AppHomestayPackageItem) => ({
          label: item.packageName,
          value: String(item.packageType),
          days: item.days,
        })
      )
      const activeDuration =
        durations.length > 0
          ? durations[0]
          : { label: '一周', value: '1', days: 7 }

      const endDate = calcEndDate(startDate, activeDuration.days)

      this.setData({
        homestay: homestayDetail,
        startDate,
        endDate,
        durations,
        duration: activeDuration.value,
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
        checkOutDate: endDate,
        packageType: activeDuration.value,
        pageNo: '1',
        pageSize: '10',
      })
      const rooms: AppHomestayRoomListItem[] = roomList.rooms || []
      this.setData({
        rooms,
      }, () => {
        this.calcDescriptionExpand()
      })
    } catch (e) {
      // ignore for now
    }
  },
  calcDescriptionExpand() {
    // Wait for the render to complete
    setTimeout(() => {
      const query = this.createSelectorQuery()
      query.select('.description-measure').boundingClientRect()
      query.exec((res) => {
        if (!res || !res[0]) return
        const height = res[0].height
        const sysInfo = wx.getSystemInfoSync()
        // 26rpx * 1.6 * 3 lines
        const maxHeightRpx = 26 * 1.6 * 3
        const maxHeightPx = (maxHeightRpx * sysInfo.windowWidth) / 750

        // Add a small buffer to avoid floating point issues
        if (height > maxHeightPx + 1) {
          this.setData({ showExpandBtn: true })
        } else {
          this.setData({ showExpandBtn: false })
        }
      })
    }, 100)
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
    const data = this.data as HomestayDetailState
    const durations = data.durations || []
    const current = durations.find((d) => d.value === data.duration) ||
      durations[0] || { value: '1', days: 7, label: '一周' }
    const endDate = calcEndDate(startDate as string, current.days)
    this.setData({ startDate, endDate, duration: current.value })
    const homestay = data.homestay
    if (!homestay) {
      return
    }

    getHomestayAvailableRooms({
      homestayId: String(homestay.id),
      checkInDate: startDate as string,
      checkOutDate: endDate,
      packageType: current.value,
      pageNo: '1',
      pageSize: '10',
    }).then((roomList) => {
      const rooms: AppHomestayRoomListItem[] = roomList.rooms || []
      this.setData({ rooms })
    })
  },
  onDurationTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const value = e.currentTarget.dataset.value as string
    const data = this.data as HomestayDetailState
    const durations = data.durations || []
    const selected = durations.find((d) => d.value === value) ||
      durations[0] || { value, days: 7, label: '一周' }

    const startDate = data.startDate
    if (!startDate) {
      this.setData({
        duration: selected.value,
      })
      return
    }

    const endDate = calcEndDate(startDate, selected.days)
    this.setData({
      duration: selected.value,
      endDate,
    })

    const homestay = data.homestay
    if (!homestay) {
      return
    }

    getHomestayAvailableRooms({
      homestayId: String(homestay.id),
      checkInDate: startDate as string,
      checkOutDate: endDate,
      packageType: selected.value,
      pageNo: '1',
      pageSize: '10',
    }).then((roomList) => {
      const rooms: AppHomestayRoomListItem[] = roomList.rooms || []
      this.setData({ rooms })
    })
  },
  onRoomTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    _e: WechatMiniprogram.CustomEvent
  ) {
    const homestayId = this.data.homestay.id
    const room = (_e.detail || {}).room as {
      id?: string
      homestayId?: string
    }
    if (!room || !room.id) {
      return
    }
    const { startDate, duration, endDate } = this.data as HomestayDetailState
    smartNavigateTo(
      `/pages/homestay-room/detail?id=${encodeURIComponent(
        room.id
      )}&homestayId=${encodeURIComponent(
        homestayId || ''
      )}&startDate=${encodeURIComponent(
        startDate
      )}&duration=${encodeURIComponent(
        duration
      )}&checkOutDate=${encodeURIComponent(endDate)}`
    )
  },
  onShareAppMessage() {
    const homestay = this.data.homestay
    if (!homestay) {
      return {
        title: 'DAO龙潭 - 民宿详情',
        path: '/pages/homestay/list',
      }
    }
    return {
      title: homestay.name || '民宿详情',
      path: `/pages/homestay/detail?id=${homestay.id}`,
      imageUrl: homestay.logo || '',
    }
  },
  onShareTimeline() {
    const homestay = this.data.homestay
    if (!homestay) {
      return {
        title: 'DAO龙潭 - 民宿详情',
      }
    }
    return {
      title: homestay.name || '民宿详情',
      query: `id=${homestay.id}`,
      imageUrl: homestay.logo || '',
    }
  },
})
