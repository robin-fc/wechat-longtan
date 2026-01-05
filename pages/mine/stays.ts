import { getMyOrderList } from '../../api/order'
import type { AppOrderListRespVO } from '../../model/order'
import { goBack } from '../../utils/navigation'
import { formatYMDHM } from '../../utils/date'

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

function mapPaymentStatusText(status: number): string {
  if (status === 0) return '待支付'
  if (status === 1) return '支付中'
  if (status === 2) return '支付成功'
  if (status === 3) return '支付失败'
  if (status === 4) return '已关闭'
  return ''
}

Page<MyStaysState, WechatMiniprogram.IAnyObject>({
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
    const filter = (this.data as MyStaysState).activeFilter
    const type =
      filter === 'all'
        ? '5'
        : filter === 'unpaid'
        ? '1'
        : filter === 'pending'
        ? '2'
        : filter === 'upcoming'
        ? '3'
        : '4'
    const page = await getMyOrderList(type, '1', '20')
    const list: AppOrderListRespVO[] = (page && page.list) || []
    const items: StayItemView[] = list.map((it) => ({
      id: it.bizOrderNo,
      title: it.title,
      statusText: mapPaymentStatusText(it.status),
      timeText: `${formatYMDHM(it.checkInDate)} ~ ${formatYMDHM(it.checkOutDate)}`,
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

