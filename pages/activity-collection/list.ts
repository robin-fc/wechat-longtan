import { fetchActivityCollections } from '../../api/activity'
import type { ActivityCollection } from '../../model/activity'
import { smartNavigateTo } from '../../utils/navigation'

interface CollectionListState {
  collections: ActivityCollection[]
}

Page<CollectionListState, WechatMiniprogram.IAnyObject>({
  data: {
    collections: [],
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    const collections = await fetchActivityCollections()
    this.setData({
      collections,
    })
  },
  onCollectionTap(
    _e: WechatMiniprogram.BaseEvent
  ) {
    const id = _e.currentTarget.dataset.id as string
    if (!id) {
      return
    }
    smartNavigateTo(
      `/pages/activity-collection/detail?id=${encodeURIComponent(id)}`
    )
  },
})
