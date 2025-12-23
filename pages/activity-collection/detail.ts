import { fetchActivityCollectionDetail } from '../../api/activity'
import type { ActivityCollection } from '../../model/activity'
import { smartNavigateTo, goBack } from '../../utils/navigation'

interface CollectionDetailState {
  collection: ActivityCollection | null
  menuTop: number
  menuHeight: number
}

Page<CollectionDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    collection: null,
    menuTop: 0,
    menuHeight: 44,
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const id = options.id as string
    if (!id) {
      return
    }
    const menuRect = wx.getMenuButtonBoundingClientRect()
    this.setData({
      menuTop: menuRect ? menuRect.top : 0,
      menuHeight: menuRect ? menuRect.height : 44,
    })
    const collection = await fetchActivityCollectionDetail(id)
    if (!collection) {
      return
    }
    this.setData({
      collection,
    })
  },
  onBackTap() {
    goBack()
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
