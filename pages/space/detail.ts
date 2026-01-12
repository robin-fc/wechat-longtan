import { smartNavigateTo } from '../../utils/navigation'
import { getActivityList } from '../../api/activity'
import type { Activity, Organizer } from '../../model/activity'

interface SpaceDetailState {
  id: string
  name: string
  desc: string
  address: string
  images: string[]
  activityCount: number
  activities: Activity[]
  organizer: Organizer | null
  loading: boolean
}

Page<SpaceDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    id: '',
    name: '',
    desc: '',
    address: '',
    images: [],
    activityCount: 0,
    activities: [],
    organizer: null,
    loading: false,
  },
  async onLoad(options: { id?: string }) {
    const id = options.id || '1'
    this.setData({ id, loading: true })

    try {
      // 获取该空间下的活动列表及空间详情
      const res = await getActivityList({
        pageNo: '1',
        pageSize: '10',
        spaceId: id
      })

      // 绑定在售活动数量
      this.setData({ activityCount: res.onSaleCount || 0 })

      // 绑定空间介绍 (如果接口有返回 detail)
      if (res.detail) {
        this.setData({ desc: res.detail })
      }

      const activities = res.pageResult && res.pageResult.list ? res.pageResult.list.map(it => ({
        ...it,
        poster: {
           id: String(it.id),
           url: it.logo || '',
        },
        price: {
          amount: it.fee || 0,
          currency: 'CNY',
          unit: '人'
        }
      })) : []

      // 尝试从活动列表中获取空间名称等信息 (如果活动列表有数据)
      if (activities.length > 0) {
          const firstActivity = activities[0]
          if (firstActivity.spaceName) {
              this.setData({ name: firstActivity.spaceName })
          }
      }

      this.setData({ activities })

    } catch (e) {
      console.error(e)
    } finally {
      this.setData({ loading: false })
    }
  },
  onActivityTap(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id
    if (id) {
      smartNavigateTo(`/pages/activity/detail?id=${id}`)
    }
  },
  onMapTap() {
      // 实际开发中应该有经纬度数据
      // wx.openLocation({
      //   latitude: this.data.latitude,
      //   longitude: this.data.longitude,
      //   name: this.data.name,
      //   address: this.data.address
      // })
      wx.showToast({
          title: '地图功能开发中',
          icon: 'none'
      })
  },
  onShareAppMessage() {
    return {
      title: this.data.name,
      path: `/pages/space/detail?id=${this.data.id}`,
      imageUrl: this.data.images[0] || ''
    }
  }
})
