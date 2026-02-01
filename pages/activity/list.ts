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
  statusList: { name: string; value: number }[]
  currentStatus: number
  rawActivities: any[]
  typeDict?: any[]
}

Page<ActivityListState, WechatMiniprogram.IAnyObject>({
  data: {
    activityType: '',
    activities: [],
    rawActivities: [],
    filterGroups: [],
    activeGroupId: '',
    activeItems: [],
    activeItemId: '',
    pageNo: 1,
    hasMore: true,
    statusList: [
      { name: '进行中', value: 1 },
      { name: '待开始', value: 0 },
      { name: '历史活动', value: 3 },
    ],
    currentStatus: 1,
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1,
      })
    }
    // Only auto-load if not loaded or if coming from other page with filter? 
    // For now keep existing logic but be careful not to overwrite initial load
    try {
      const category = wx.getStorageSync('ACTIVITY_CATEGORY_FILTER')
      if (category) {
        wx.removeStorageSync('ACTIVITY_CATEGORY_FILTER')
        this.setData({
          activeItemId: category,
          activityType: category,
          // Reset status to default or keep? Usually default
          currentStatus: 1
        })
        this.setData({
          activeItemId: category,
          activityType: category,
          // Reset status to default or keep? Usually default
          currentStatus: 1
        })
        if (this.data.rawActivities.length === 0) {
          this.loadActivities()
        } else {
          this.filterActivities()
        }
        return // Avoid double load if onLoad also calls it
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
      activityType: id || '',
      activeItems: [],
      activeItemId: '',
    })
    this.filterActivities()
  },
  onFilterItemTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const id = e.currentTarget.dataset.id as string
    this.setData({
      activeItemId: id || '',
      activityType: id || '',
    })
    this.filterActivities()
  },
  onStatusTabTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const value = e.currentTarget.dataset.value
    if (value === this.data.currentStatus) return
    this.setData({
      currentStatus: value,
      pageNo: 1,
      hasMore: true,
      activities: [],
    })
    this.filterActivities()
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    const typeDict = await ensureActivityTypeDict()
    const filterGroups = [
      { id: '', name: '全部' },
      ...typeDict.map(item => ({ id: item.value, name: item.label }))
    ]
    this.setData({ filterGroups, typeDict })

    await this.loadActivities()
  },
  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({
      pageNo: 1,
      hasMore: true,
      rawActivities: [],
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
    // Client-side filtering only supports 100 items for now 
  },
  async loadActivities(this: WechatMiniprogram.Page.TrivialInstance) {
    const pageSize = 100
    // Fetch ALL activities regardless of type for client-side filtering
    const res = await getActivityList({
      activityType: '',
      pageNo: '1', // Always fetch first page of ALL data
      pageSize: String(pageSize),
    })
    const list = (res && res.pageResult && res.pageResult.list) || []

    const typeDict = await ensureActivityTypeDict()
    const formattedList = list.map((it) => ({
      ...it,
      poster: {
        id: String(it.id),
        url: (it as any).posterUrl || it.logo || '/assets/images/activity.jpg',
      },
      secondaryTag: (() => {
        const name = typeDict.find((x) => x.value === it.activityType)?.label || (it as any).activityType
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
      // Pass raw registeredUsers, component handles it
      registeredUsers: it.registeredUsers,
      registeredCount: it.registeredCount
    }))

    this.setData({
      rawActivities: formattedList
    })

    this.filterActivities()
  },

  filterActivities(this: WechatMiniprogram.Page.TrivialInstance) {
    const { rawActivities, activityType, currentStatus } = this.data as ActivityListState

    let filtered = rawActivities

    // 1. Filter by Status
    if (currentStatus !== undefined) {
      filtered = filtered.filter(item => {
        const status = item.activityStatus
        if (currentStatus === 1) { // 进行中
          return status === '报名中' || status === '活动中'
        } else if (currentStatus === 0) { // 待开始
          return status === '待开始'
        } else if (currentStatus === 3) { // 历史活动
          return status === '已结束'
        }
        return true
      })
    }

    // 2. Filter by Category (Activity Type)
    if (activityType) {
      const typeDict = (this.data as any).typeDict || []
      const targetLabel = typeDict.find((x: any) => x.value === activityType)?.label
      filtered = filtered.filter(item => {
        return item.activityType === activityType || (targetLabel && item.activityType === targetLabel)
      })
    }

    this.setData({
      activities: filtered,
      hasMore: false
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
