import {
  fetchHomestayDetail,
  fetchHomestayRoomDetail,
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
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const id = options.id as string
    if (!id) {
      return
    }
    const homestay = await fetchHomestayDetail(id)
    if (!homestay) {
      return
    }
    const room = await fetchHomestayRoomDetail('room-1')
    this.setData({
      homestay,
      rooms: [room],
    })
  },
  onBackTap() {
    goBack()
  },
  onStartDateChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.PickerChange
  ) {
    this.setData({
      startDate: e.detail.value,
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
    _e: WechatMiniprogram.CustomEvent
  ) {
    const room = (_e.detail || {}).room as {
      id?: string
      homestayId?: string
    }
    if (!room || !room.id) {
      return
    }
    smartNavigateTo(
      `/pages/homestay-room/detail?id=${encodeURIComponent(
        room.id
      )}&homestayId=${encodeURIComponent(room.homestayId || '')}`
    )
  },
})
