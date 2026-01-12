import { getActivityCollections, getActivityList } from '../../api/activity'
import type { Activity } from '../../model/activity'
import type { ActivityCollection } from '../../model/activity'
import { smartNavigateTo, goBack } from '../../utils/navigation'
import { formatYMDHM } from '../../utils/date'

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
    const collRes = await getActivityCollections('1', '100').catch(() => null)
    const collList = ((collRes as any)?.list as any[]) || []
    const base = collList.find((c) => String(c.id) === String(id))
    if (!base) {
      wx.showToast({ title: '活动合集不存在', icon: 'none' })
      return
    }
    const res = await getActivityList({
      collectionId: String(id),
      pageNo: '1',
      pageSize: '100',
    })
    const list = (res && res.pageResult && res.pageResult.list) || []
    const activities: Activity[] = list.map((it) => ({
      ...it,
      poster: {
        id: String(it.id),
        url: it.logo || '/assets/images/activity.jpg',
      },
      secondaryTag: (() => {
        const raw = (it as any).activityType
        let name = ''
        if (raw !== undefined && raw !== null && raw !== '') {
          const s = String(raw)
          const isNum = typeof raw === 'number' || /^\d+$/.test(s)
          if (isNum) {
            name = String(raw)
          } else {
            name = s
          }
        }
        return {
          name: name || it.collectionName || '活动',
        }
      })(),
      space: {
        id: it.spaceId,
        name: it.spaceName || '',
        address: '',
        mapImages: [],
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
      companions: {
        companions: [],
        totalCount: 0,
      },
    }))
    const collection = { ...base, activities } as any
    this.setData({ collection })
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
