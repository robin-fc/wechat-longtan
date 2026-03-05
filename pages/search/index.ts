import { fetchSearchPageConfig, globalSearch } from '../../api/search'
import { ensureActivityTypeDict } from '../../api/activity'
import type { SearchFrom, HotSearchItem } from '../../api/search'
import type { Activity } from '../../model/activity'
import { formatYMD } from '../../utils/date'
import { smartNavigateTo, goBack } from '../../utils/navigation'
import { AppHomestayListRespVO } from '../../model/homestay'

interface SearchPageState {
  from: SearchFrom
  keyword: string
  placeholder: string
  hotKeywords: HotSearchItem[]
  activities: Activity[]
  collections: any[]
  homestays: AppHomestayListRespVO[]
  spaces: any[]
  users: any[]
  hasSearched: boolean
}

Page<SearchPageState, WechatMiniprogram.IAnyObject>({
  data: {
    from: 'home',
    keyword: '',
    placeholder: '',
    hotKeywords: [],
    activities: [],
    collections: [],
    homestays: [],
    spaces: [],
    users: [],
    hasSearched: false,
  },
  onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const fromParam = options.from === 'activity' ? 'activity' : 'home'
    const config = fetchSearchPageConfig(fromParam)
    this.setData({
      from: fromParam,
      placeholder: config.placeholder,
      hotKeywords: config.hotKeywords,
    })
  },
  onBackTap() {
    goBack()
  },
  onKeywordInput(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      keyword: e.detail.value,
    })
  },
  onSearchConfirm() {
    this.doSearch()
  },
  onSearchTap() {
    this.doSearch()
  },
  onHotKeywordTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const keyword = e.currentTarget.dataset.keyword as string
    this.setData({
      keyword,
    })
    this.doSearch()
  },
  async doSearch(this: WechatMiniprogram.Page.TrivialInstance) {
    const state = this.data as SearchPageState
    const keyword = state.keyword
    const trimmed = keyword.trim()
    if (!trimmed) {
      this.setData({
        activities: [],
        spaces: [],
        homestays: [],
        users: [],
        collections: [],
        hasSearched: true,
      })
      return
    }

    wx.showLoading({ title: '搜索中...' })
    try {
      const typeDict = await ensureActivityTypeDict()
      const res = await globalSearch(trimmed)

      const activities = (res.activities || []).map((it: any) => ({
        ...it,
        poster: {
          id: String(it.id),
          url:
            it.posterUrl || it.logo || '/assets/images/activity.jpg',
        },
        secondaryTag: (() => {
          const raw = it.activityType
          const s = String(raw ?? '').trim()
          const dictName = typeDict.find((x) => x.value === s)?.label || s
          return {
            name: dictName || it.collectionName || '活动',
          }
        })(),
        timeRange: {
          startTime: formatYMD(it.startTime),
          endTime: formatYMD(it.endTime),
        },
        price: {
          amount: it.fee || 0,
          currency: 'CNY',
          unit: '人',
        },
      }))

      this.setData({
        activities,
        spaces: res.spaces || [],
        homestays: res.homestays || [],
        users: res.users || [],
        collections: [],
        hasSearched: true,
      })
    } catch (e) {
      console.error(e)
      wx.showToast({ title: '搜索失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },
  onActivityTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CustomEvent
  ) {
    const activity = (e.detail || {}).activity as {
      id?: string
    }
    if (!activity || !activity.id) {
      return
    }
    smartNavigateTo(
      `/pages/activity/detail?id=${encodeURIComponent(activity.id)}`
    )
  },
  onCollectionTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CustomEvent
  ) {
    const collection = (e.detail || {}).collection as {
      id?: string
    }
    if (!collection || !collection.id) {
      return
    }
    smartNavigateTo(
      `/pages/activity-collection/detail?id=${encodeURIComponent(
        collection.id
      )}`
    )
  },
  onHomestayTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CustomEvent
  ) {
    const homestay = (e.detail || {}).homestay as {
      id?: string
    }
    if (!homestay || !homestay.id) {
      return
    }
    smartNavigateTo(
      `/pages/homestay/detail?id=${encodeURIComponent(homestay.id)}`
    )
  },
  onSpaceTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CustomEvent
  ) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    smartNavigateTo(`/pages/space/detail?id=${encodeURIComponent(String(id))}`)
  },
  onUserTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.CustomEvent
  ) {
    const user = (e.detail || {}).user as { userId?: string; id?: string }
    const id = user?.userId || user?.id
    if (!id) return
    smartNavigateTo(`/pages/user/other-profile/index?userId=${encodeURIComponent(String(id))}`)
  },
  onShareAppMessage() {
    return {
      title: 'DAO龙潭 - 搜索发现',
      path: '/pages/home/index',
    }
  },
  onShareTimeline() {
    return {
      title: 'DAO龙潭 - 搜索发现',
    }
  },
})
