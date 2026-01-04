import { fetchHomeData } from '../../api/home'
import type { HomePageData, HomeEntryItem } from '../../api/home'
import { getBannerList } from '../../api/banner'
import { getActivityList, getActivityCollections } from '../../api/activity'
import { getAvailableHomestayList } from '../../api/homestay'
import { ActivityType, ActivityTypeLabel } from '../../model/activity'
import { smartNavigateTo } from '../../utils/navigation'

interface HomeState {
  loading: boolean
  pageData: HomePageData | null
  navPaddingTop: number
  heroCurrent: number
  heroBgUrl: string
  topBgHeight: number
}

Page<HomeState, WechatMiniprogram.IAnyObject>({
  data: {
    loading: true,
    pageData: null,
    navPaddingTop: 0,
    heroCurrent: 1,
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
    const win = wx.getWindowInfo()
    const ratio = 750 / (win.windowWidth || 750)
    const halfScreenRpx = Math.round((win.windowHeight || 1334) * ratio / 2)
    this.setData({
      navPaddingTop: win.statusBarHeight || 0,
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
      try {
        const page = await getActivityList({ pageNo: '1', pageSize: '5' })
        const list = (page && page.list) || []
        data.hotActivities = list.map((a) => {
          const tag =
            typeof a.activityType === 'number'
              ? ActivityTypeLabel[a.activityType as ActivityType]
              : ActivityTypeLabel[Number(a.activityType) as ActivityType]
          return {
            ...a,
            poster: { id: String(a.id), url: a.logo || '' },
            timeRange: { startTime: a.startTime, endTime: a.endTime },
            price: { amount: Number(a.fee || 0), currency: 'CNY', unit: '人' },
            secondaryTag: { name: tag || '' },
          }
        })
      } catch (e) {
        console.error('Fetch activities failed:', e)
      }
      try {
        const page = await getActivityCollections('1', '5')
        data.collections = (page && page.list) || []
      } catch (e) {
        console.error('Fetch collections failed:', e)
      }
      try {
        const list = await getAvailableHomestayList()
        data.homestays = (list || [])
          .slice(0, 3)
          .map((h) => ({
            ...h,
            referencePrice: {
              amount: (h as any).minPrice || 0,
              currency: 'CNY',
              unit: '天',
            },
          }))
      } catch (e) {
        console.error('Fetch homestays failed:', e)
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
      try {
        wx.setStorageSync('ACTIVITY_CATEGORY_FILTER', item.value)
      } catch (e) {
        console.error('Set storage failed:', e)
      }
      wx.switchTab({
        url: '/pages/activity/list',
      })
      return
    }
    if (item.type === 'homestay') {
      wx.switchTab({
        url: '/pages/homestay/list',
      })
      return
    }
    if (item.type === 'collection') {
      smartNavigateTo('/pages/activity-collection/list')
      return
    }
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
