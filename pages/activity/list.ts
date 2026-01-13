import { getActivityList } from '../../api/activity'
import type { Activity } from '../../model/activity'
import { ensureActivityTypeDict } from '../../api/activity'
import { smartNavigateTo, goBack } from '../../utils/navigation'
import { formatYMDHM } from '../../utils/date'

interface ActivityListState {
  activityType: string
  activities: Activity[]
  filterGroups: { id: string; name: string }[]
  activeGroupId: string
  activeItems: { id: string; name: string }[]
  activeItemId: string
  pageNo: number
  hasMore: boolean
}

Page<ActivityListState, WechatMiniprogram.IAnyObject>({
  data: {
    activityType: '',
    activities: [],
    filterGroups: [],
    activeGroupId: '',
    activeItems: [],
    activeItemId: '',
    pageNo: 1,
    hasMore: true,
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1,
      })
    }
    try {
      const category = wx.getStorageSync('ACTIVITY_CATEGORY_FILTER')
      if (category) {
        wx.removeStorageSync('ACTIVITY_CATEGORY_FILTER')
        this.setData({
          activeItemId: category,
          activityType: category,
        })
        this.loadActivities()
      }
    } catch (e) {
      console.error('Read storage failed:', e)
    }
  },
  onFilterGroupTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const id = e.currentTarget.dataset.id as string
    this.setData({
      activeGroupId: id || '',
      activeItems: [],
      activeItemId: '',
      pageNo: 1,
      hasMore: true,
      activities: [],
    })
  },
  onFilterItemTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const id = e.currentTarget.dataset.id as string
    this.setData({
      activeItemId: id || '',
      activityType: id || '',
      pageNo: 1,
      hasMore: true,
      activities: [],
    })
    this.loadActivities()
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    await this.loadActivities()
  },
  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({
      pageNo: 1,
      hasMore: true,
      activities: [],
    })
    await this.loadActivities()
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  async onReachBottom() {
    const { hasMore, pageNo } = this.data as ActivityListState
    if (!hasMore) return
    this.setData({
      pageNo: pageNo + 1,
    })
    await this.loadActivities()
  },
  async loadActivities(this: WechatMiniprogram.Page.TrivialInstance) {
    const { activityType, pageNo, activities: currentActivities } = this.data as ActivityListState
    const pageSize = 20
    const res = await getActivityList({
      activityType,
      pageNo: String(pageNo),
      pageSize: String(pageSize),
    })
    const list = (res && res.pageResult && res.pageResult.list) || []
    
    // Check if we have more data
    const hasMore = list.length === pageSize
    
    const typeDict = await ensureActivityTypeDict()
    const newActivities = list.map((it) => ({
      ...it,
      poster: {
        id: String(it.id),
        url: (it as any).posterUrl || it.logo || '/assets/images/activity.jpg',
      },
      secondaryTag: (() => {
        const name = (it as any).activityType
        return {
          name: name || it.collectionName || '-',
        }
      })(),
      timeRange: {
        startTime: formatYMDHM(it.startTime),
        endTime: formatYMDHM(it.endTime),
      },
      price: {
        amount: it.fee || 0,
        currency: 'CNY',
        unit: '人',
      },
    }))
    
    const allActivities = pageNo === 1 ? newActivities : [...currentActivities, ...newActivities]
    
    console.log('activity list:', allActivities)
    this.setData({
      activities: allActivities,
      hasMore,
    })
  },
  onBackTap() {
    goBack()
  },
  onSearchTap() {
    smartNavigateTo('/pages/search/index?from=activity')
  },
  onPublishTap() {
    smartNavigateTo('/pages/activity/publish')
  },
  onActivityTypeChange(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const id = e.currentTarget.dataset.id as string
    this.setData({
      activityType: id,
    })
    this.loadActivities()
  },
  onActivityTap(e: WechatMiniprogram.CustomEvent) {
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
