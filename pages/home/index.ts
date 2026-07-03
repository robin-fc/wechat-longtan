import { fetchHomeData } from '../../api/home'
import { fetchMyProfile } from '../../api/mine'
import { updateUserInfo } from '../../api/user'
import { smartNavigateTo } from '../../utils/navigation'
import { AppActivityTypeRespVO, HomePageData } from '../../model/home'
import { Banner } from '../../model/banner'
import { getArticleRecommendPage, AppMpArticleRecommendRespVO } from '../../api/article'

/** bannerType 文字 → 背景色映射表 */
const BANNER_TYPE_COLOR_MAP: Record<string, string> = {
  '在地民俣': '#EC4714',
  '艺术创作': '#9480EA',
  '数字技能': '#0194BF',
  '自然体验': '#73A3C4',
  '手工制作': '#E27F32',
  '生活美食': '#AB7D14',
  '身心成长': '#FAC209',
  '兴趣爱好': '#1D96FF',
}

interface HomeState {
  loading: boolean
  pageData: HomePageData | null
  navPaddingTop: number
  heroCurrent: number
  hero: Banner | null
  topBgHeight: number
  showDigitalNomadPopup: boolean
  canCreateActivity: boolean
  showPhoneAuthModal: boolean
  articles: AppMpArticleRecommendRespVO[]
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
    showPhoneAuthModal: false,
    articles: [],
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
        showDigitalNomadPopup: false,
        canCreateActivity: false,
        showPhoneAuthModal: false,
      })
      return
    }

    try {
      const profile = await fetchMyProfile()
      if (profile) {
        // Digital Nomad is level '2' or text contains '数字游民'
        const levelStr = String(profile.memberLevel)
        const isDigitalNomad = levelStr === '2' || levelStr.includes('数字游民')

        const isActivityCreator = isDigitalNomad || ['新村民', '老村民'].some(s => levelStr.includes(s))

        // Check if user skipped the popup today
        const skipDate = wx.getStorageSync('DIGITAL_NOMAD_SKIP_DATE')
        const today = new Date().toDateString()
        const skippedToday = skipDate === today

        this.setData({
          showDigitalNomadPopup: !isDigitalNomad && !skippedToday,
          canCreateActivity: isActivityCreator,
        })

        // Check phone number
        if (!profile.memberPhone) {

          setTimeout(() => {
            this.setData({ showPhoneAuthModal: true })
          }, 5000)
        }
      }

    } catch (e) {
      console.error('Failed to fetch profile in home', e)
    }
  },
  onPopupApply() {
    this.setData({ showDigitalNomadPopup: false })
    wx.setStorageSync('DIGITAL_NOMAD_SKIP_DATE', new Date().toDateString())
    // Navigate to certification or profile edit
    // User didn't specify, linking to profile edit as best guess for "Apply" (filling info)
    smartNavigateTo('/pages/digital-nomad/apply/index')
  },
  onPopupSkip() {
    this.setData({ showDigitalNomadPopup: false })
    wx.setStorageSync('DIGITAL_NOMAD_SKIP_DATE', new Date().toDateString())
  },
  onDigitalNomadApplyTap() {
    smartNavigateTo('/pages/digital-nomad/apply/index')
  },
  onVolunteerApplyTap() {
    smartNavigateTo('/pages/volunteer/apply/index')
  },
  onCoCreatorApplyTap() {
    smartNavigateTo('/pages/co-creator/apply/index')
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
      // 给每个 carousel 项计算对应 typeColor
      const carousel = (data.carousel || []).map((item: any) => ({
        ...item,
        typeColor: BANNER_TYPE_COLOR_MAP[item.bannerType] || '#428C35',
      }))
      this.setData({
        pageData: { ...data, carousel },
        loading: false,
        hero,
      })
    } catch (_err) {
      this.setData({
        loading: false,
      })
    }
    this.loadArticles()
  },
  async loadArticles() {
    try {
      const res = await getArticleRecommendPage(1, 3)
      this.setData({
        articles: res?.list || [],
      })
    } catch (e) {
      console.error('Fetch articles failed:', e)
    }
  },
  onSearchTap() {
    smartNavigateTo('/pages/search/index?from=home')
  },

  onArticleTap(e: WechatMiniprogram.BaseEvent) {
    const item = e.currentTarget.dataset.item as AppMpArticleRecommendRespVO
    if (item && item.articleUrl) {
      wx.navigateTo({
        url: `/pages/webview/index?url=${encodeURIComponent(item.articleUrl)}`
      })
    }
  },
  onEntryTap(e: WechatMiniprogram.BaseEvent) {
    const item = e.currentTarget.dataset.item as AppActivityTypeRespVO
    wx.setStorage({
      key: 'ACTIVITY_CATEGORY_FILTER',
      data: item.value,
      success: () => {
        wx.switchTab({
          url: '/pages/activity/list',
        })
      },
      fail: (err) => {
        console.error('Save to storage failed', err)
        // Fallback navigate anyway
        wx.switchTab({
          url: '/pages/activity/list',
        })
      }
    })
  },
  onAboutItemTap(e: WechatMiniprogram.BaseEvent) {
    const item = e.currentTarget.dataset.item as { path?: string; title?: string }
    if (item && item.title === '龙潭故事') {
      const storyUrl = 'https://mobilesingle.dmctv.cn:8085/villages/6350000000039/index.html'
      wx.navigateTo({
        url: `/pages/webview/index?url=${encodeURIComponent(storyUrl)}`
      })
      return
    }
    if (item && item.path) {
      smartNavigateTo(item.path)
    }
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
      if (!banner.url) return

      if (banner.isIner) {
        smartNavigateTo(banner.url)
      } else {
        // External link -> Webview
        wx.navigateTo({
          url: `/pages/webview/index?url=${encodeURIComponent(banner.url)}`
        })
      }
    }
  },
  onShareAppMessage() {
    return {
      title: 'DAO龙潭 - 探索数字乡建',
      path: '/pages/home/index',
    }
  },
  onShareTimeline() {
    return {
      title: 'DAO龙潭 - 探索数字乡建',
    }
  },
  closePhoneAuthModal() {
    this.setData({ showPhoneAuthModal: false })
  },
  async onPhoneAuthSuccess(e: any) {
    const { phone } = e.detail
    this.setData({ showPhoneAuthModal: false })

    // Update user info with phone number
    if (phone && phone.phoneNumber) {
      try {
        await updateUserInfo({
          memberPhone: phone.phoneNumber
        })
        wx.showToast({ title: '绑定成功', icon: 'success' })
      } catch (error) {
        console.error('Failed to update phone number', error)
        wx.showToast({ title: '更新手机号失败', icon: 'none' })
      }
    } else {
      wx.showToast({ title: '绑定成功', icon: 'success' })
    }
  },
})
