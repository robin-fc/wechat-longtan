import { getRoomDetail } from '../../api/room'
import { fetchMyProfile } from '../../api/mine'
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
  showPermissionPopup: boolean
  packageType: string
  packageName: string
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
    showPermissionPopup: false,
    packageType: '',
    packageName: '',
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    console.log('homestay-room detail onLoad options:', options)
    const id = options.id as string
    const homestayId = options.homestayId as string
    const startDate = (options.startDate as string) || ''
    const durationParam = (options.duration as string) || ''
    const packageType = (options.packageType as string) || ''
    const checkOutDateOption = (options.checkOutDate as string) || ''
    console.log('homestay-room detail - durationParam:', durationParam, 'packageType:', packageType)
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
    let nights = 7

    // durationParam 现在传入的是天数（7, 14, 30, 90），而不是 packageType
    const durationDays = parseInt(durationParam, 10)
    if (!isNaN(durationDays) && durationDays > 0) {
      nights = durationDays
      // 如果没有传入 checkOutDate，则根据天数计算
      if (!checkOutDate && checkInDate) {
        const start = new Date(checkInDate.replace(/-/g, '/'))
        if (!isNaN(start.getTime())) {
          const end = new Date(start)
          end.setDate(start.getDate() + durationDays)
          const y = end.getFullYear()
          const m = String(end.getMonth() + 1).padStart(2, '0')
          const d = String(end.getDate()).padStart(2, '0')
          checkOutDate = `${y}-${m}-${d}`
        }
      }
    }

    console.log(checkInDate, checkOutDate, nights, packageType)
    this.setData({
      menuTop: menuRect ? menuRect.top : 0,
      menuHeight: menuRect ? menuRect.height : 44,
      homestayId,
      checkInDate,
      checkOutDate,
      packageType: packageType || durationParam,
      nights,
    })

    await this.fetchRoomDetail(homestayId, id, packageType)
    this.updateNights()
  },
  async fetchRoomDetail(
    homestayId: string,
    id: string,
    packageType?: string
  ) {
    try {
      const res = await getRoomDetail({ id: Number(id) })

      const duration = (res.roomNumber || '').split('-')[1] || '一周起'

      // 根据 packageType 从 phasePrice 中获取对应价格
      let roomPrice = res.price || 0
      if (packageType && res.phasePrice && res.phasePrice.length > 0) {
        const packageTypeNum = Number(packageType)
        const priceItem = res.phasePrice.find(p => p.packageType === packageTypeNum)
        if (priceItem) {
          roomPrice = priceItem.price
        }
        console.log('fetchRoomDetail - packageType:', packageType, 'packageTypeNum:', packageTypeNum, 'priceItem:', priceItem, 'roomPrice:', roomPrice)
      }
      console.log('fetchRoomDetail - phasePrice:', res.phasePrice)

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
        price: { amount: roomPrice, currency: 'CNY', unit: '天' },
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
      // phasePrice 中的价格已经是总包价格，不需要乘以天数
      const amount =
        state.room && state.room.price ? state.room.price.amount : 0
      const totalPrice = amount  // 直接使用总包价格
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
    const room = state.room
    if (!room) {
      return
    }

    // 检查数字游民身份
    this.checkDigitalNomadStatus().then((isDigitalNomad: boolean) => {
      if (!isDigitalNomad) {
        this.setData({ showPermissionPopup: true })
        return
      }

      // 是数字游民，允许申请
      smartNavigateTo(
        `/pages/homestay-apply/form?roomId=${encodeURIComponent(
          room.id
        )}&homestayId=${encodeURIComponent(
          room.homestayId
        )}&startDate=${encodeURIComponent(
          state.checkInDate
        )}&duration=${encodeURIComponent(String(state.nights))}&packageType=${encodeURIComponent(
          state.packageType || ''
        )}`
      )
    })
  },
  async checkDigitalNomadStatus(): Promise<boolean> {
    const accessToken = wx.getStorageSync('accessToken')
    if (!accessToken) {
      const state = this.data as RoomDetailState
      if (state.room) {
        const returnUrl = `/pages/homestay-room/detail?id=${state.room.id}&homestayId=${state.room.homestayId}&startDate=${state.checkInDate}&duration=${state.packageType}&checkOutDate=${state.checkOutDate}`
        wx.navigateTo({
          url: `/pages/login/index?returnUrl=${encodeURIComponent(returnUrl)}`,
        })
      }
      return false
    }

    try {
      const profile = await fetchMyProfile()
      if (profile) {
        const levelStr = String(profile.memberLevel)
     
        return  levelStr.includes('数字游民') || levelStr.includes('新村民') || levelStr.includes('老村民')
      }
      return false
    } catch (e) {
      console.error('Failed to fetch profile', e)
      return false
    }
  },
  onPermissionApply(this: WechatMiniprogram.Page.TrivialInstance) {
    smartNavigateTo('/pages/digital-nomad/apply/index')
  },
  onPermissionSkip(this: WechatMiniprogram.Page.TrivialInstance) {
    this.setData({ showPermissionPopup: false })
  },
  onShareAppMessage() {
    const state = this.data as RoomDetailState
    const room = state.room
    if (!room) {
      return {
        title: 'DAO龙潭 - 房间详情',
        path: '/pages/homestay/list',
      }
    }
    return {
      title: room.name || '房间详情',
      path: `/pages/homestay-room/detail?id=${room.id}&homestayId=${room.homestayId}`,
      imageUrl: room.images && room.images.length > 0 ? room.images[0].url : '',
    }
  },
  onShareTimeline() {
    const state = this.data as RoomDetailState
    const room = state.room
    if (!room) {
      return {
        title: 'DAO龙潭 - 房间详情',
      }
    }
    return {
      title: room.name || '房间详情',
      query: `id=${room.id}&homestayId=${room.homestayId}`,
      imageUrl: room.images && room.images.length > 0 ? room.images[0].url : '',
    }
  },
})
