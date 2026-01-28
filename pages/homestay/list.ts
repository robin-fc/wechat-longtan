import {
  getAvailableHomestayList,
  getHomestayAvailableList,
} from '../../api/homestay'
import {
  AppHomestayListItem,
  AppHomestayListReqVO,
  AppHomestayListRespVO,
} from '../../model/homestay'
import { toISO8601FromLocal } from '../../utils/isoTime'
import { goBack, smartNavigateTo } from '../../utils/navigation'

interface HomestayListState {
  startDate: string
  homestays: AppHomestayListItem[]
}

Page<HomestayListState, WechatMiniprogram.IAnyObject>({
  data: {
    startDate: '',
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
      const params: AppHomestayListReqVO = {
        checkInDate: toISO8601FromLocal(this.data.startDate),
        pageNo: '1',
        pageSize: '10',
      }
      const apiList = await getHomestayAvailableList(params)
      const list: AppHomestayListRespVO[] = apiList.list.slice()

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
