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
  isLoading: boolean
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
      { name: '历史活动', value: 2 },
    ],
    currentStatus: 0,
    isLoading: false,
  },
  async onShow() {
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

        const typeDict = await ensureActivityTypeDict()
        const selectedItem = typeDict.find(item => item.value === category)
        const otherItems = typeDict.filter(item => item.value !== category)

        const filterGroups = [
          { id: '', name: '全部' }
        ]
        if (selectedItem) {
          filterGroups.push({ id: selectedItem.value, name: selectedItem.label })
        }
        filterGroups.push(...otherItems.map(item => ({ id: item.value, name: item.label })))

        this.setData({
          activeGroupId: category,
          activeItemId: '',
          activityType: category,
          activeItems: [],
          currentStatus: 0,
          pageNo: 1,
          hasMore: true,
          activities: [],
          filterGroups,
          typeDict
        })
        if (this.data.activities.length === 0) {
          this.loadActivities()
        }
        return
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
      pageNo: 1,
      hasMore: true,
      activities: [],
    })
    this.loadActivities()
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
    this.loadActivities()
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    const typeDict = await ensureActivityTypeDict()
    try {
      const category = wx.getStorageSync('ACTIVITY_CATEGORY_FILTER')
      if (category) {
        wx.removeStorageSync('ACTIVITY_CATEGORY_FILTER')
        const selectedItem = typeDict.find(item => item.value === category)
        const otherItems = typeDict.filter(item => item.value !== category)

        const filterGroups = [
          { id: '', name: '全部' }
        ]
        if (selectedItem) {
          filterGroups.push({ id: selectedItem.value, name: selectedItem.label })
        }
        filterGroups.push(...otherItems.map(item => ({ id: item.value, name: item.label })))

        this.setData({
          activeGroupId: category,
          activeItemId: '',
          activityType: category,
          activeItems: [],
          currentStatus: 0,
          pageNo: 1,
          hasMore: true,
          activities: [],
          filterGroups,
          typeDict
        })
      } else {
        const filterGroups = [
          { id: '', name: '全部' },
          ...typeDict.map(item => ({ id: item.value, name: item.label }))
        ]
        this.setData({ filterGroups, typeDict })
      }
    } catch (e) {
      const filterGroups = [
        { id: '', name: '全部' },
        ...typeDict.map(item => ({ id: item.value, name: item.label }))
      ]
      this.setData({ filterGroups, typeDict })
    }

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
    // Client-side filtering only supports 100 items for now 
    await this.loadActivities()
  },
  async loadActivities(this: WechatMiniprogram.Page.TrivialInstance) {
    const { pageNo, activityType, currentStatus } = this.data as ActivityListState
    const pageSize = 10

    // Map currentStatus to API expected status if needed, or pass directly. 
    // Assuming API accepts the numeric values 0, 1, 3 etc. or strings?
    // User said "activityStatus".

    this.setData({ isLoading: true })

    try {
      const res = await getActivityList({
        activityType: activityType || '',
        activityStatus: currentStatus, // Check type
        pageNo: String(pageNo),
        pageSize: String(pageSize),
      })

      const list = (res && res.pageResult && res.pageResult.list) || []
      const hasMore = (res && res.pageResult && res.pageResult.total > pageNo * pageSize) || false

      const typeDict = await ensureActivityTypeDict()
      const formattedList = list.map((it) => ({
        ...it,
        poster: {
          id: String(it.id),
          url: (it as any).posterUrl || it.logo || '/assets/images/activity.jpg',
        },
        secondaryTag: (() => {
          const name = typeDict.find((x) => x.value === it.activityType)?.label || (it as any).activityType
          // Or if backend returns friendly name now?
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
        registeredUsers: it.registeredUsers,
        registeredCount: it.registeredCount
      }))

      if (pageNo === 1) {
        this.setData({
          activities: formattedList,
          hasMore
        })
      } else {
        this.setData({
          activities: this.data.activities.concat(formattedList),
          hasMore
        })
      }
    } finally {
      this.setData({ isLoading: false })
    }
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
  onShareAppMessage() {
    return {
      title: 'DAO龙潭 - 精彩活动等你来',
      path: '/pages/activity/list',
    }
  },
  onShareTimeline() {
    return {
      title: 'DAO龙潭 - 精彩活动等你来',
    }
  },
})
