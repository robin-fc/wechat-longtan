import { fetchHomeData } from '../../api/home'
import { smartNavigateTo } from '../../utils/navigation'
import { AppActivityTypeRespVO, HomePageData } from '../../model/home'
import { Banner } from '../../model/banner'

interface HomeState {
  loading: boolean
  pageData: HomePageData | null
  navPaddingTop: number
  heroCurrent: number
  hero: Banner | null
  topBgHeight: number
}

Page<HomeState, WechatMiniprogram.IAnyObject>({
  data: {
    loading: true,
    pageData: null,
    navPaddingTop: 0,
    heroCurrent: 1,
    hero: null,
    topBgHeight: 0,
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0,
      })
    }
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    const win = wx.getWindowInfo()
    const ratio = 750 / (win.windowWidth || 750)
    const halfScreenRpx = Math.round(((win.windowHeight || 1334) * ratio) / 2)
    this.setData({
      navPaddingTop: win.statusBarHeight || 0,
      topBgHeight: halfScreenRpx,
    })
    await this.loadData()
  },
  async loadData(this: WechatMiniprogram.Page.TrivialInstance) {
    try {
      const data = await fetchHomeData()
      const idx = this.data.heroCurrent
      const hero = data.carousel[idx]
      this.setData({
        pageData: data,
        loading: false,
        hero: hero,
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
    const item = e.currentTarget.dataset.item as AppActivityTypeRespVO
    wx.setStorageSync('ACTIVITY_CATEGORY_FILTER', item.value)
    wx.switchTab({
      url: '/pages/activity/list',
    })
  },
  onFloatingPublishTap() {
    smartNavigateTo('/pages/activity/publish')
  },
  onMoreHotActivityTap() {
    wx.switchTab({
      url: '/pages/activity/list',
    })
  },
  onMoreCollectionsTap() {
    smartNavigateTo('/pages/activity-collection/list')
  },
  onMoreHomestaysTap() {
    wx.switchTab({
      url: '/pages/homestay/list',
    })
  },
  onHeroChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.SwiperChange
  ) {
    const idx = e.detail.current
    this.setData({
      heroCurrent: idx,
    })
  },
  onHeroIndicatorTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const idx = Number((e.currentTarget.dataset || {}).idx || 0)
    this.setData({
      heroCurrent: idx,
    })
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
  onBannerTap(e: WechatMiniprogram.BaseEvent) {
    const idx = e.currentTarget.dataset.idx
    const data = (this.data as HomeState).pageData
    if (data && data.carousel && data.carousel[idx]) {
      const banner = data.carousel[idx]
      if (banner.url) {
        smartNavigateTo(banner.url)
      }
    }
  },
})
