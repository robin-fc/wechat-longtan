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
}

Page<SpaceDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    activeTab: 'activity',
    title: '数字游民活动中心',
    activityCount: 3,
    address: '屏南县龙潭村8号',
    homestays: [],
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
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
