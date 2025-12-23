import { goBack, smartNavigateTo } from '../../utils/navigation'
import { fetchHomestayList } from '../../api/homestay'
import type { Homestay } from '../../model/homestay'

type SpaceTab = 'activity' | 'homestay' | 'space'

interface SpaceDetailState {
  activeTab: SpaceTab
  title: string
  activityCount: number
  address: string
  homestays: Homestay[]
  menuTop: number
  menuHeight: number
}

Page<SpaceDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    activeTab: 'activity',
    title: '数字游民活动中心',
    activityCount: 3,
    address: '屏南县龙潭村8号',
    homestays: [],
    menuTop: 0,
    menuHeight: 88,
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    const sys = wx.getSystemInfoSync()
    const rect =
      typeof wx.getMenuButtonBoundingClientRect === 'function'
        ? wx.getMenuButtonBoundingClientRect()
        : null
    const menuTop = rect && rect.top ? rect.top : sys.statusBarHeight || 0
    const menuHeight = rect && rect.height ? rect.height : 44
    this.setData({ menuTop, menuHeight })
    const homestays = await fetchHomestayList({})
    this.setData({ homestays })
  },
  onBackTap() {
    goBack()
  },
  onTabTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const tab = e.currentTarget.dataset.tab as SpaceTab
    this.setData({
      activeTab: tab,
    })
  },
  onHomestayTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CustomEvent
  ) {
    const detail = (e.detail || {}) as { homestay?: Homestay }
    const homestay = detail.homestay
    if (!homestay || !homestay.id) {
      return
    }
    smartNavigateTo(
      `/pages/homestay/detail?id=${encodeURIComponent(homestay.id)}`
    )
  },
})
