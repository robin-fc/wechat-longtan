import { fetchMyActivityFilters } from '../../api/mine'
import { fetchMyActivities } from '../../api/mine'
import { fetchActivityCollections } from '../../api/activity'
import type { Activity } from '../../model/activity'
import type { ActivityCollection } from '../../model/activity'
import { goBack, smartNavigateTo } from '../../utils/navigation'

interface FilterItem {
  id: string
  name: string
}

interface MyActivitiesState {
  filters: FilterItem[]
  activeFilterId: string
  activities: Activity[]
  collections: ActivityCollection[]
}

Page<MyActivitiesState, WechatMiniprogram.IAnyObject>({
  data: {
    filters: [],
    activeFilterId: '',
    activities: [],
    collections: [],
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    const filters = fetchMyActivityFilters()
    const activities = await fetchMyActivities()
    const collections = await fetchActivityCollections()
    this.setData({
      filters,
      activeFilterId: filters.length > 0 ? filters[0].id : '',
      activities,
      collections,
    })
  },
  onBackTap() {
    goBack()
  },
  onFilterTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const id = e.currentTarget.dataset.id as string
    this.setData({
      activeFilterId: id,
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
  onCollectionTap(e: WechatMiniprogram.CustomEvent) {
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
  onAddCollectionTap() {
    smartNavigateTo('/pages/activity-collection/publish')
  },
})
