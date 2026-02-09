import {
  getAvailableHomestayList,
  getHomestayAvailableList,
} from '../../api/homestay'
import {
  AppHomestayListItem,
  AppHomestayListReqVO,
  AppHomestayListRespVO,
} from '../../model/homestay'
import { formatYMD1 } from '../../utils/date'
import { toISO8601FromLocal } from '../../utils/isoTime'
import { goBack, smartNavigateTo } from '../../utils/navigation'

interface HomestayListState {
  startDate: string
  homestays: AppHomestayListItem[]
  pageNo: number
  pageSize: number
  hasMore: boolean
  isLoading: boolean
}

Page<HomestayListState, WechatMiniprogram.IAnyObject>({
  data: {
    startDate: '',
    homestays: [],
    pageNo: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false,
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2,
      })
    }
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    if (!this.data.startDate) {
      this.setData({
        startDate: formatYMD1(new Date(), '-'),
      })
    }
    await this.loadHomestays(true)
  },
  async loadHomestays(
    this: WechatMiniprogram.Page.TrivialInstance,
    reset = false
  ) {
    if (this.data.isLoading) return
    if (!reset && !this.data.hasMore) return

    this.setData({ isLoading: true })

    if (reset) {
      this.setData({
        pageNo: 1,
        homestays: [],
        hasMore: true,
      })
    }

    try {
      const { pageNo, pageSize, startDate } = this.data
      const params: AppHomestayListReqVO = {
        checkInDate: toISO8601FromLocal(startDate),
        pageNo: String(pageNo),
        pageSize: String(pageSize),
      }

      const apiList = await getHomestayAvailableList(params)
      const list: AppHomestayListRespVO[] = apiList.list || []

      this.setData({
        homestays: reset ? list : [...this.data.homestays, ...list],
        pageNo: pageNo + 1,
        hasMore: list.length >= pageSize,
      })
    } catch (e) {
      console.error(e)
      // If API fails, maybe try fallback or just stop loading
      if (reset) {
        // Only try fallback on initial load if needed, otherwise just show error or empty
        try {
          const list = await getAvailableHomestayList({
            pageNo: '1',
            pageSize: '10',
          })
          this.setData({
            homestays: list || [],
            hasMore: false, // Fallback usually doesn't support pagination same way or assumes limited set
          })
        } catch (err) {
          console.error(err)
        }
      }
    } finally {
      this.setData({ isLoading: false })
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
    this.loadHomestays(true)
  },
  onReachBottom() {
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
  onShareAppMessage() {
    return {
      title: 'DAO龙潭 - 发现理想民宿',
      path: '/pages/homestay/list',
    }
  },
  onShareTimeline() {
    return {
      title: 'DAO龙潭 - 发现理想民宿',
    }
  },
})
