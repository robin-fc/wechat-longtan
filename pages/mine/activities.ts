import { ensureActivityTypeDict } from '../../api/activity'
import { fetchMyActivityFilters } from '../../api/mine'
import { fetchMyActivities, fetchMyCollections } from '../../api/mine'
import type { Activity } from '../../model/activity'
import type { ActivityCollection } from '../../model/activity-collection'
import { goBack, smartNavigateTo } from '../../utils/navigation'

interface FilterItem {
  id: string
  name: string
  type?: string
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
    const first = filters[0]
    const activities = first && first.type ? await fetchMyActivities(first.type) : []
    const collections = await fetchMyCollections()
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
    const filters = (this.data as MyActivitiesState).filters
    const f = filters.find((it) => it.id === id)
    if (!f) {
      return
    }
    this.setData({ activeFilterId: id })
    if (f.id === 'collections') {
      this.loadCollections()
      return
    }
    if (f.type) {
      this.loadActivities(f.type)
    }
  },
  async loadActivities(this: WechatMiniprogram.Page.TrivialInstance, type: string) {
    const list = await fetchMyActivities(type)
    this.setData({ activities: list })
  },
  async loadCollections(this: WechatMiniprogram.Page.TrivialInstance) {
    const list = await fetchMyCollections()
    this.setData({ collections: list })
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
