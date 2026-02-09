import { getActivityList } from '../../api/activity'
import { getActivityCollections } from '../../api/activity-collection'
import type { Activity } from '../../model/activity'
import type { ActivityCollection } from '../../model/activity-collection'
import { smartNavigateTo, goBack } from '../../utils/navigation'
import { formatYMDHM } from '../../utils/date'

interface CollectionDetailState {
  collection: ActivityCollection | null
  menuTop: number
  menuHeight: number
  isDescriptionExpanded: boolean
  showExpandBtn: boolean
}

Page<CollectionDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    collection: null,
    menuTop: 0,
    menuHeight: 44,
    isDescriptionExpanded: false,
    showExpandBtn: false,
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
    const list = (res && res?.pageResult && res?.pageResult.list) || []
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
        id: (it as any).space?.id || 0,
        name: (it as any).space?.name || '',
        address: (it as any).space?.address || '',
        mapImages: (it as any).space?.mapImages || [],
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
    this.setData({ collection }, () => {
      this.calcDescriptionExpand()
    })
  },
  calcDescriptionExpand() {
    // Wait for the render to complete
    setTimeout(() => {
      const query = this.createSelectorQuery()
      query.select('.description-measure').boundingClientRect()
      query.exec((res) => {
        if (!res || !res[0]) return
        const height = res[0].height
        const sysInfo = wx.getSystemInfoSync()
        // 26rpx * 1.6 * 3 lines
        const maxHeightRpx = 26 * 1.6 * 3
        const maxHeightPx = (maxHeightRpx * sysInfo.windowWidth) / 750

        // Add a small buffer to avoid floating point issues
        if (height > maxHeightPx + 1) {
          this.setData({ showExpandBtn: true })
        } else {
          this.setData({ showExpandBtn: false })
        }
      })
    }, 100)
  },
  toggleDescription(this: WechatMiniprogram.Page.TrivialInstance) {
    this.setData({
      isDescriptionExpanded: !this.data.isDescriptionExpanded,
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
  onShareAppMessage() {
    const collection = this.data.collection
    if (!collection) {
      return {
        title: 'DAO龙潭 - 活动合集',
        path: '/pages/activity-collection/list',
      }
    }
    return {
      title: collection.name || '活动合集',
      path: `/pages/activity-collection/detail?id=${collection.id}`,
      imageUrl: collection.logo || '',
    }
  },
  onShareTimeline() {
    const collection = this.data.collection
    if (!collection) {
      return {
        title: 'DAO龙潭 - 活动合集',
      }
    }
    return {
      title: collection.name || '活动合集',
      query: `id=${collection.id}`,
      imageUrl: collection.logo || '',
    }
  },
})
