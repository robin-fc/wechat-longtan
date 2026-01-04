import { fetchHomestayList, getHomestayAvailableList } from '../../api/homestay'
import type { Homestay } from '../../model/homestay'
import { goBack, smartNavigateTo } from '../../utils/navigation'

type DurationType = 'week' | 'twoWeeks' | 'month' | 'threeMonths'

interface DurationOption {
  label: string
  value: DurationType
}

interface HomestayListState {
  startDate: string
  duration: DurationType
  durations: DurationOption[]
  homestays: Homestay[]
}

Page<HomestayListState, WechatMiniprogram.IAnyObject>({
  data: {
    startDate: '',
    duration: 'week',
    durations: [
      { label: '一周', value: 'week' },
      { label: '两周', value: 'twoWeeks' },
      { label: '一个月', value: 'month' },
      { label: '三个月', value: 'threeMonths' },
    ],
    homestays: [],
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2,
      })
    }
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    await this.loadHomestays()
  },
  async loadHomestays(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    try {
      const apiList = await getHomestayAvailableList()
      const tagMap: Record<string, string> = {
        '0': '全天热水',
        '1': '免费Wi-Fi',
        '2': '付费停车位',
        '3': '免费停车位',
        '4': '洗衣机',
        '5': '行李寄存',
        '6': '有早餐',
      }
      const list: Homestay[] = (apiList || []).map((it) => {
        const coverUrl =
          (it.mapImages || '')
            .split(';')
            .map((s) => s.trim())
            .filter(Boolean)[0] || '/assets/images/homestay.jpg'
        const featureTags = (it.tags || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((code) => ({ id: code, name: tagMap[code] || code }))
        return {
          id: String(it.id),
          name: it.name,
          cover: { id: `home-${it.id}-cover`, url: coverUrl },
          address: it.address,
          featureTags,
          referencePrice: { amount: it.minPrice || 0, currency: 'CNY', unit: '天' },
        }
      })
      this.setData({
        homestays: list,
      })
    } catch {
      const state = this.data as HomestayListState
      const list = await fetchHomestayList({
        startDate: state.startDate,
        durationType: state.duration,
      })
      this.setData({
        homestays: list,
      })
    }
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
    this.loadHomestays()
  },
  onDurationTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const value = e.currentTarget.dataset.value as DurationType
    this.setData({
      duration: value,
    })
    this.loadHomestays()
  },
  onHomestayTap(
    _e: WechatMiniprogram.CustomEvent
  ) {
    const homestay = (_e.detail || {}).homestay as {
      id?: string
    }
    if (!homestay || !homestay.id) {
      return
    }
    smartNavigateTo(
      `/pages/homestay/detail?id=${encodeURIComponent(homestay.id)}`
    )
  },
})
