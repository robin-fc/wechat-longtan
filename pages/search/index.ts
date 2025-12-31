import { fetchSearchPageConfig } from '../../api/search'
import { getActivityList } from '../../api/activity'
import type {
  SearchFrom,
  HotSearchItem,
} from '../../api/search'
import type { Activity } from '../../model/activity'
import { ActivityType, ActivityTypeLabel } from '../../model/activity'
import { formatYMD } from '../../utils/date'
import { smartNavigateTo, goBack } from '../../utils/navigation'

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
    const keyword = (this.data as SearchPageState).keyword
    const trimmed = keyword.trim()
    if (!trimmed) {
      this.setData({ activities: [], hasSearched: true })
      return
    }
    const page = await getActivityList({
      activityType: trimmed,
      pageNo: '1',
      pageSize: '20',
    })
    const list = (page && page.list) || []
    const activities = list.map((it) => ({
      ...it,
      poster: {
        id: String(it.id),
        url: (it as any).posterUrl || it.logo || '/assets/images/activity.jpg',
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
      space: {
        id: it.space?.id || '',
        name: it.space?.name || '',
        address: it.space?.address || '',
        mapImages: it.space?.mapImages || [],
      },
      timeRange: {
        startTime: formatYMD(it.startTime),
        endTime: formatYMD(it.endTime),
      },
      price: {
        amount: it.fee || 0,
        currency: 'CNY',
        unit: '人',
      },
      companions: {
        companions: (it.companions?.companions || []).map((x) => ({
          id: x.id,
          avatar: x.avatar,
          nickname: x.nickname,
        })),
        totalCount: it.companions?.totalCount || 0,
      },
    }))
    this.setData({
      activities,
      hasSearched: true,
    })
  },
  onActivityTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
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
})
