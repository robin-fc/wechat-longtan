import { fetchHomeData } from '../../api/home'
import type { HomePageData, HomeEntryItem } from '../../api/home'
import { smartNavigateTo } from '../../utils/navigation'

interface HomeState {
  loading: boolean
  pageData: HomePageData | null
  navPaddingTop: number
}

Page<HomeState, WechatMiniprogram.IAnyObject>({
  data: {
    loading: true,
    pageData: null,
    navPaddingTop: 0,
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    const sys = wx.getSystemInfoSync()
    this.setData({
      navPaddingTop: sys.statusBarHeight || 0,
    })
    await this.loadData()
  },
  async loadData(this: WechatMiniprogram.Page.TrivialInstance) {
    try {
      const data = await fetchHomeData()
      this.setData({
        pageData: data,
        loading: false,
      })
    } catch (_err) {
      this.setData({
        loading: false,
      })
    }
  },
  onSearchTap() {
    smartNavigateTo('/pages/search/index?from=home')
  },
  onEntryTap(e: WechatMiniprogram.BaseEvent) {
    const item = e.currentTarget.dataset.item as HomeEntryItem
    if (!item) {
      return
    }
    if (item.type === 'activityCategory') {
      smartNavigateTo(
        `/pages/activity/list?category=${encodeURIComponent(item.value)}`
      )
      return
    }
    if (item.type === 'homestay') {
      smartNavigateTo('/pages/homestay/list')
      return
    }
    if (item.type === 'collection') {
      smartNavigateTo('/pages/activity-collection/list')
      return
    }
  },
  onMoreHotActivityTap() {
    smartNavigateTo('/pages/activity/list')
  },
  onMoreCollectionsTap() {
    smartNavigateTo('/pages/activity-collection/list')
  },
  onMoreHomestaysTap() {
    smartNavigateTo('/pages/homestay/list')
  },
  onActivityCardTap(e: WechatMiniprogram.CustomEvent) {
    const activity = (e.detail || {}).activity as {
      id?: string
    }
    if (activity && activity.id) {
      smartNavigateTo(
        `/pages/activity/detail?id=${encodeURIComponent(activity.id)}`
      )
    }
  },
  onCollectionCardTap(e: WechatMiniprogram.CustomEvent) {
    const collection = (e.detail || {}).collection as {
      id?: string
    }
    if (collection && collection.id) {
      smartNavigateTo(
        `/pages/activity-collection/detail?id=${encodeURIComponent(
          collection.id
        )}`
      )
    }
  },
  onHomestayCardTap(e: WechatMiniprogram.CustomEvent) {
    const homestay = (e.detail || {}).homestay as {
      id?: string
    }
    if (homestay && homestay.id) {
      smartNavigateTo(
        `/pages/homestay/detail?id=${encodeURIComponent(homestay.id)}`
      )
    }
  },
})
