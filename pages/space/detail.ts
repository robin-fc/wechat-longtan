import { smartNavigateTo } from '../../utils/navigation'
import { getActivityList } from '../../api/activity'
import type { Activity, Organizer } from '../../model/activity'
import { getSpaceDetail } from '../../api/space'
import { formatYMDHM } from '../../utils/date'

interface SpaceDetailState {
  id: string
  name: string
  desc: string // 纯文本简介 (deprecated or used for share)
  description: string // 富文本详情
  address: string
  images: string[]
  mapImage: string // 小地图预览
  activityCount: number
  activities: Activity[]
  organizer: any | null // 使用 any 暂时规避类型差异，或者定义完整 Manager 类型
  loading: boolean
  isExpanded: boolean // 详情展开状态
}

Page<SpaceDetailState, WechatMiniprogram.IAnyObject>({
  data: {
    id: '',
    name: '',
    desc: '',
    description: '',
    address: '',
    images: [],
    mapImage: '',
    activityCount: 0,
    activities: [],
    organizer: null,
    loading: false,
    isExpanded: false
  },
  async onLoad(options: { id?: string }) {
    const id = options.id || '1'
    this.setData({ id, loading: true })

    try {
      // 获取空间详情
      const detail = await getSpaceDetail(Number(id))
      this.setData({
        name: detail.name,
        desc: detail.intro || '',
        description: detail.description || '', // API 返回的是富文本
        address: detail.address || '',
        images: detail.logo ? [detail.logo] : [],
        mapImage: (detail.mapImages && detail.mapImages.length > 0) ? detail.mapImages[0] : '',
        organizer: detail.manager || null
      })

      // 获取该空间下的活动列表
      const res = await getActivityList({
        pageNo: '1',
        pageSize: '10',
        spaceId: id
      })

      // 绑定在售活动数量
      this.setData({ activityCount: res.onSaleCount || 0 })

      const activities = res.pageResult && res.pageResult.list ? res.pageResult.list.map(it => ({
        ...it,
        timeRange: {
          startTime: formatYMDHM(it.startTime),
          endTime: formatYMDHM(it.endTime)
        },
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
      console.log(activities)
      // 尝试从活动列表中获取空间名称等信息 (如果活动列表有数据)
      // if (activities.length > 0) {
      //     const firstActivity = activities[0]
      //     if (firstActivity.spaceName) {
      //         this.setData({ name: firstActivity.spaceName })
      //     }
      // }

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

  onShareAppMessage() {
    return {
      title: this.data.name,
      path: `/pages/space/detail?id=${this.data.id}`,
      imageUrl: this.data.images[0] || ''
    }
  },
  onToggleExpand() {
    this.setData({
      isExpanded: !this.data.isExpanded
    })
  },
  onPreviewMap() {
    if (this.data.mapImage) {
      wx.previewImage({
        urls: [this.data.mapImage]
      })
    }
  }
})
