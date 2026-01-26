import { fetchHomeData } from '../../api/home'
import { fetchMyProfile } from '../../api/mine'
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
  showDigitalNomadPopup: boolean
  canCreateActivity: boolean
}

Page<HomeState, WechatMiniprogram.IAnyObject>({
  data: {
    loading: true,
    pageData: null,
    navPaddingTop: 0,
    heroCurrent: 1,
    hero: null,
    topBgHeight: 0,
    showDigitalNomadPopup: false,
    canCreateActivity: false,
  },
  async onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0,
      })
    }
    await this.checkUserStatus()
  },
  async checkUserStatus() {
    const accessToken = wx.getStorageSync('accessToken')
    if (!accessToken) {
      this.setData({
        canCreateActivity: false, // Not logged in, can't create
        showDigitalNomadPopup: false, // Don't show popup if not logged in (or maybe we should? assume no for now)
      })
      return
    }

    try {
      const profile = await fetchMyProfile()
      if (profile) {
        // Digital Nomad is level '2'
        const isDigitalNomad = String(profile.memberLevel) === '2'

        // Activity Creator is tag '1'
        // memberTags can be string[] or maybe string depending on API consistency, safe check handled in UI usually but here we check data
        let tags: string[] = []
        if (Array.isArray(profile.memberTags)) {
          tags = profile.memberTags.map(String)
        } else if (typeof profile.memberTags === 'string') {
          // Handle potential string case if API is messy, similar to user.ts logic
          // But fetchMyProfile returns UserProfile where memberTags is string[]. 
          // We'll trust the type but map just in case.
          tags = [String(profile.memberTags)]
        }

        const isActivityCreator = tags.includes('1')

        // Check if user skipped the popup today
        const skipDate = wx.getStorageSync('DIGITAL_NOMAD_SKIP_DATE')
        const today = new Date().toDateString()
        const skippedToday = skipDate === today

        this.setData({
          showDigitalNomadPopup: !isDigitalNomad && !skippedToday,
          canCreateActivity: isActivityCreator,
        })
      }
    } catch (e) {
      console.error('Failed to fetch profile in home', e)
    }
  },
  onPopupApply() {
    this.setData({ showDigitalNomadPopup: false })
    // Navigate to certification or profile edit
    // User didn't specify, linking to profile edit as best guess for "Apply" (filling info)
    smartNavigateTo('/pages/digital-nomad/apply/index')
  },
  onPopupSkip() {
    this.setData({ showDigitalNomadPopup: false })
    wx.setStorageSync('DIGITAL_NOMAD_SKIP_DATE', new Date().toDateString())
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
