import { getActivityList } from '../../api/activity'
import type { Activity } from '../../model/activity'
import { ActivityType, ActivityTypeLabel } from '../../model/activity'
import { smartNavigateTo, goBack } from '../../utils/navigation'
import { formatYMDHM } from '../../utils/date'

interface ActivityListState {
  activityType: string
  activities: Activity[]
  filterGroups: { id: string; name: string }[]
  activeGroupId: string
  activeItems: { id: string; name: string }[]
  activeItemId: string
}

Page<ActivityListState, WechatMiniprogram.IAnyObject>({
  data: {
    activityType: '',
    activities: [],
    filterGroups: [],
    activeGroupId: '',
    activeItems: [],
    activeItemId: '',
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
    })
    this.loadActivities()
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    await this.loadActivities()
  },
  async loadActivities(this: WechatMiniprogram.Page.TrivialInstance) {
    const type = (this.data as ActivityListState).activityType
    const page = await getActivityList({
      activityType: type,
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
        startTime: formatYMDHM(it.startTime),
        endTime: formatYMDHM(it.endTime),
      },
      price: {
        amount: it.fee || 0,
        currency: 'CNY',
        unit: '人',
      },
      companions: (() => {
        const list = (it.companions as any)?.companions || []
        const total = (it.companions as any)?.totalCount || 0
        const arr = Array.isArray(list)
          ? list.slice(0, 3).map((u: any) => ({
              id: String(u.id || ''),
              avatar: { url: u.logo || '/assets/images/default-avatar.png' },
              nickname: u.nickname || u.memberName || '',
            }))
          : []
        return {
          companions: arr,
          totalCount: total,
        }
      })(),
     
    }))
    this.setData({
      activities,
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
