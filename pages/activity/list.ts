import {
  fetchActivityFilters,
  fetchActivityList,
  type ActivityFilterGroup,
  type ActivityFilterItem,
} from '../../api/activity'
import type { Activity } from '../../model/activity'
import { smartNavigateTo, goBack } from '../../utils/navigation'

interface ActivityListState {
  filterGroups: ActivityFilterGroup[]
  activeGroupId: string
  activeItemId: string
  activeItems: ActivityFilterItem[]
  activities: Activity[]
}

Page<ActivityListState, WechatMiniprogram.IAnyObject>({
  data: {
    filterGroups: [],
    activeGroupId: '',
    activeItemId: '',
    activeItems: [],
    activities: [],
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    const groups = await fetchActivityFilters()
    let activeGroupId = ''
    let activeItemId = ''
    let activeItems: ActivityFilterItem[] = []
    if (groups.length > 0) {
      activeGroupId = groups[0].id
      activeItems = groups[0].items
      if (activeItems.length > 0) {
        activeItemId = activeItems[0].id
      }
    }
    this.setData({
      filterGroups: groups,
      activeGroupId,
      activeItemId,
      activeItems,
    })
    await this.loadActivities()
  },
  async loadActivities(this: WechatMiniprogram.Page.TrivialInstance) {
    const groups = (this.data as ActivityListState).filterGroups
    const activeGroupId = (this.data as ActivityListState).activeGroupId
    const group = groups.find((g) => g.id === activeGroupId)
    const list = await fetchActivityList({
      primaryCategory:
        group && group.primaryCategory !== 'all'
          ? group.primaryCategory
          : undefined,
    })
    this.setData({
      activities: list,
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
  onFilterGroupTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const id = e.currentTarget.dataset.id as string
    const groups = (this.data as ActivityListState).filterGroups
    const group = groups.find((g) => g.id === id)
    if (!group) {
      return
    }
    const activeItems = group.items
    const activeItemId = activeItems.length > 0 ? activeItems[0].id : ''
    this.setData({
      activeGroupId: id,
      activeItems,
      activeItemId,
    })
    this.loadActivities()
  },
  onFilterItemTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const id = e.currentTarget.dataset.id as string
    this.setData({
      activeItemId: id,
    })
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
