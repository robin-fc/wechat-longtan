import { fetchHomestayRoomDetail } from '../../api/homestay'
import type { HomestayRoom } from '../../model/homestay'
import { goBack, smartNavigateTo } from '../../utils/navigation'

interface RoomDetailState {
  room: HomestayRoom | null
  checkInDate: string
  checkOutDate: string
  nights: number
}

Page<RoomDetailState>({
  data: {
    room: null,
    checkInDate: '',
    checkOutDate: '',
    nights: 0,
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.Query
  ) {
    const id = options.id as string
    if (!id) {
      return
    }
    const room = await fetchHomestayRoomDetail(id)
    this.setData({
      room,
    })
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
      })
      return
    }
    const start = new Date(state.checkInDate).getTime()
    const end = new Date(state.checkOutDate).getTime()
    if (!isNaN(start) && !isNaN(end) && end > start) {
      const diff = end - start
      const nights = Math.round(diff / (24 * 60 * 60 * 1000))
      this.setData({
        nights,
      })
    } else {
      this.setData({
        nights: 0,
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
      `/pages/homestay-apply/form?roomId=${encodeURIComponent(state.room.id)}`
    )
  },
})

