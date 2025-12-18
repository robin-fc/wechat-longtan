import { fetchActivityCollectionDetail } from '../../api/activity'
import type { ActivityCollection } from '../../model/activity'
import { smartNavigateTo } from '../../utils/navigation'

interface CollectionDetailState {
  collection: ActivityCollection | null
}

Page<CollectionDetailState>({
  data: {
    collection: null,
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.Query
  ) {
    const id = options.id as string
    if (!id) {
      return
    }
    const collection = await fetchActivityCollectionDetail(id)
    if (!collection) {
      return
    }
    this.setData({
      collection,
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

