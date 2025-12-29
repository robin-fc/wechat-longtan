import { fetchHomeData } from '../../api/home'
import type { HomePageData, HomeEntryItem } from '../../api/home'
import { getBannerList } from '../../api/banner'
import { smartNavigateTo } from '../../utils/navigation'

interface HomeState {
  loading: boolean
  pageData: HomePageData | null
  navPaddingTop: number
  heroCurrent: number
  heroCardMarginX: number
  heroPrevMargin: string
  heroNextMargin: string
  heroBgUrl: string
  topBgHeight: number
}

Page<HomeState, WechatMiniprogram.IAnyObject>({
  data: {
    loading: true,
    pageData: null,
    navPaddingTop: 0,
    heroCurrent: 1,
    heroCardMarginX: 40,
    heroPrevMargin: '60rpx',
    heroNextMargin: '60rpx',
    heroBgUrl: '',
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
    const sys = wx.getSystemInfoSync()
    const ratio = 750 / (sys.windowWidth || 750)
    const halfScreenRpx = Math.round((sys.windowHeight || 1334) * ratio / 2)
    this.setData({
      navPaddingTop: sys.statusBarHeight || 0,
      topBgHeight: halfScreenRpx,
    })
    await this.loadData()
  },
  async loadData(this: WechatMiniprogram.Page.TrivialInstance) {
    try {
      const data = await fetchHomeData()
      try {
        const banners = await getBannerList()
        console.log('home 获取banner')
        console.log('banners:', banners)
        if (banners && banners.length > 0) {
          
          data.carousel = banners.map((b) => ({
            id: String(b.id),
            title: b.title || '',
            poster: {
              id: String(b.id),
              url: b.logo,
            },
            description: b.description || '',
            category: b.category || '',
            url: b.url,
          }))
        }
      } catch (e) {
        console.error('Fetch banners failed:', e)
      }
      const idx = this.data.heroCurrent
      const bg =
        data.carousel && data.carousel[idx] ? data.carousel[idx].poster.url : ''
      this.setData({
        pageData: data,
        loading: false,
        heroBgUrl: bg,
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
