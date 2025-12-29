import { getActivityCollections } from '../../api/activity'
import type { ActivityCollection } from '../../model/activity'
import { smartNavigateTo } from '../../utils/navigation'

interface CollectionListState {
  collections: ActivityCollection[]
}

Page<CollectionListState, WechatMiniprogram.IAnyObject>({
  data: {
    collections: [],
  },
  onLoad() {
    this.refreshData()
  },
  async refreshData() {
    const res = await getActivityCollections('1', '100')
    this.setData({
      collections: res.list || [],
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
