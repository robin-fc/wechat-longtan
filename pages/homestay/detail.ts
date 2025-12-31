import {
  fetchHomestayDetail,
  getAvailableRoomList,
} from '../../api/homestay'
import type { HomestayDetail, HomestayRoom } from '../../model/homestay'
import { goBack, smartNavigateTo } from '../../utils/navigation'
import { formatYMD } from '../../utils/date'

type DurationType = 'week' | 'twoWeeks' | 'month' | 'threeMonths'

interface DurationOption {
  label: string
  value: DurationType
}

interface HomestayDetailState {
  homestay: HomestayDetail | null
  rooms: HomestayRoom[]
  startDate: string
  duration: DurationType
  durations: DurationOption[]
  menuTop: number
  menuHeight: number
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
    const homestay = await fetchHomestayDetail(id)
    if (!homestay) {
      return
    }
    // 默认查询当天
    const today = formatYMD(new Date())
    const rooms = await getAvailableRoomList(id, today)
    this.setData({
      homestay,
      rooms,
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
