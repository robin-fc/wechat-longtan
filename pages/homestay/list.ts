import {
  getAvailableHomestayList,
  getHomestayAvailableList,
} from '../../api/homestay'
import { AppHomestayListItem } from '../../model/homestay'
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
  homestays: AppHomestayListItem[]
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
  async loadHomestays(this: WechatMiniprogram.Page.TrivialInstance) {
    try {
      const apiList = await getHomestayAvailableList()
      const list: AppHomestayListItem[] = (apiList || []).map((it) => {
        return {
          id: it.id,
          name: it.name,
          address: it.address,
          minPrice: it.minPrice || 0,
          mapImages: it.mapImages,
          tags: it.tags,
          reservedUsers: it.reservedUsers || [],
          referencePrice: {
            amount: it.minPrice || 0,
            currency: 'CNY',
            unit: '天',
          },
        }
      })
      this.setData({
        homestays: list,
      })
    } catch {
      const list = await getAvailableHomestayList({
        pageNo: '1',
        pageSize: '10',
      })
      this.setData({
        homestays: list || [],
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
  onHomestayTap(_e: WechatMiniprogram.CustomEvent) {
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
