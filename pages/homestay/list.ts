import {
  getAvailableHomestayList,
  getHomestayAvailableList,
  getHomestayPackageList,
} from '../../api/homestay'
import { AppHomestayListItem, AppHomestayListRespVO, type AppHomestayPackageItem } from '../../model/homestay'
import { goBack, smartNavigateTo } from '../../utils/navigation'

interface DurationOption {
  label: string
  value: string
}

interface HomestayListState {
  startDate: string
  duration: string
  durations: DurationOption[]
  homestays: AppHomestayListItem[]
}

Page<HomestayListState, WechatMiniprogram.IAnyObject>({
  data: {
    startDate: '',
    duration: '',
    durations: [],
    homestays: [],
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    await this.loadDurations()
    await this.loadHomestays()
  },
  async loadDurations(this: WechatMiniprogram.Page.TrivialInstance) {
    try {
      const packages = await getHomestayPackageList()
      const durations: DurationOption[] = (packages || []).map(
        (item: AppHomestayPackageItem) => ({
          label: item.packageName,
          value: item.packageName,
        })
      )
      if (durations.length > 0) {
        this.setData({
          durations,
          duration: durations[0].value,
        })
      } else {
        this.setData({
          durations: [],
        })
      }
    } catch {
      const fallbackDurations: DurationOption[] = [
        { label: '一周', value: '一周' },
        { label: '两周', value: '两周' },
        { label: '一个月', value: '一个月' },
        { label: '三个月', value: '三个月' },
      ]
      this.setData({
        durations: fallbackDurations,
        duration: fallbackDurations[0].value,
      })
    }
  },
  async loadHomestays(this: WechatMiniprogram.Page.TrivialInstance) {
    try {
      const apiList = await getHomestayAvailableList()
      const list:AppHomestayListRespVO[] =  apiList.list.slice()
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
    const value = e.currentTarget.dataset.value as string
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
