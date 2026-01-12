import { fetchSearchPageConfig } from '../../api/search'
import { getActivityList, getActivityCollections } from '../../api/activity'
import { getAvailableHomestayList } from '../../api/homestay'
import type { SearchFrom, HotSearchItem } from '../../api/search'
import type { Activity } from '../../model/activity'
import { ActivityType, ActivityTypeLabel } from '../../model/activity'
import { formatYMD } from '../../utils/date'
import { smartNavigateTo, goBack } from '../../utils/navigation'
import { AppHomestayDetail, AppHomestayListRespVO } from '../../model/homestay'

interface SearchPageState {
  from: SearchFrom
  keyword: string
  placeholder: string
  hotKeywords: HotSearchItem[]
  activities: Activity[]
  hasSearched: boolean
}

Page<SearchPageState, WechatMiniprogram.IAnyObject>({
  data: {
    from: 'home',
    keyword: '',
    placeholder: '',
    hotKeywords: [],
    activities: [],
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
        collections: [],
        homestays: [],
        hasSearched: true,
      })
      return
    }

    const promises: Promise<any>[] = []

    // 1. Activity Search
    const activityPromise = getActivityList({
      keyword: trimmed,
      pageNo: '1',
      pageSize: '20',
    }).then((page) => {
      const list = (page && page.data?.pageResult?.list) || []
      return list.map((it) => ({
        ...it,
        poster: {
          id: String(it.id),
          url:
            (it as any).posterUrl || it.logo || '/assets/images/activity.jpg',
        },
        secondaryTag: (() => {
          const raw = (it as any).activityType
          let name = ''
          if (raw !== undefined && raw !== null && raw !== '') {
            const s = String(raw)
            const isNum = typeof raw === 'number' || /^\d+$/.test(s)
            if (isNum) {
              const n = Number(raw) as ActivityType
              name = ActivityTypeLabel[n] ?? ''
            } else {
              name = s
            }
          }
          return {
            name: name || it.collectionName || '活动',
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
    })
    promises.push(activityPromise)

    // 2. Collection Search
    const collectionPromise = getActivityCollections(
      '1',
      '20',
      undefined,
      trimmed
    ).then((page) => page.list || [])
    promises.push(collectionPromise)

    // 3. Homestay Search (only if from === 'home')
    let homestayPromise: Promise<AppHomestayListRespVO[]> = Promise.resolve([])
    if (state.from === 'home') {
      homestayPromise = getAvailableHomestayList({ keyword: trimmed })
    }
    promises.push(homestayPromise)

    const [activities, collections, homestays] = await Promise.all(promises)

    this.setData({
      activities,
      collections,
      homestays,
      hasSearched: true,
    })
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
})
