import { fetchMyStays } from '../../api/mine'
import type { HomestayApplication } from '../../model/homestay'
import { goBack } from '../../utils/navigation'

type StayFilter = 'all' | 'unpaid' | 'pending' | 'upcoming' | 'checkedIn'

interface StayFilterOption {
  label: string
  value: StayFilter
}

interface StayItemView {
  id: string
  title: string
  statusText: string
  timeText: string
  address: string
}

interface MyStaysState {
  filters: StayFilterOption[]
  activeFilter: StayFilter
  items: StayItemView[]
}

function mapStayStatusText(status: HomestayApplication['status']): string {
  if (status === 'pending') {
    return '待审核'
  }
  if (status === 'confirmed') {
    return '待入住'
  }
  if (status === 'checkedIn') {
    return '已入住'
  }
  return '已取消'
}

Page<MyStaysState>({
  data: {
    filters: [
      { label: '全部', value: 'all' },
      { label: '待付款', value: 'unpaid' },
      { label: '待审核', value: 'pending' },
      { label: '待入住', value: 'upcoming' },
      { label: '已入住', value: 'checkedIn' },
    ],
    activeFilter: 'all',
    items: [],
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    await this.loadStays()
  },
  async loadStays(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const list = await fetchMyStays()
    const filter = (this.data as MyStaysState).activeFilter
    const filtered =
      filter === 'all'
        ? list
        : list.filter((item) => {
            if (filter === 'pending') {
              return item.status === 'pending'
            }
            if (filter === 'checkedIn') {
              return item.status === 'checkedIn'
            }
            if (filter === 'upcoming') {
              return item.status === 'confirmed'
            }
            return false
          })
    const items: StayItemView[] = filtered.map((item) => ({
      id: item.id,
      title: `申请民宿 ${item.homestayId} 房间 ${item.roomId}`,
      statusText: mapStayStatusText(item.status),
      timeText: `${item.stayRange.startTime} ~ ${item.stayRange.endTime}`,
      address: '龙潭民宿',
    }))
    this.setData({
      items,
    })
  },
  onBackTap() {
    goBack()
  },
  async onFilterTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const value = e.currentTarget.dataset.value as StayFilter
    this.setData({
      activeFilter: value,
    })
    await this.loadStays()
  },
})

