import { getMyOrderList, generatePayParams } from '../../api/order'
import type { AppOrderListRespVO } from '../../model/order'
import { goBack, smartNavigateTo } from '../../utils/navigation'
import { formatYMDHM, parseToDate } from '../../utils/date'

function formatDateToCN(v: any): string {
  const d = parseToDate(v)
  if (!d) return ''
  return `${d.getMonth() + 1}月${d.getDate()}日`
}


type StayFilter = 'all' | 'unpaid' | 'pending' | 'upcoming' | 'checkedIn' | 'refunded'

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
  showPayButton: boolean
  showCancelButton: boolean
  amount: number
  roomImage: string
  tags: string
}

interface MyStaysState {
  filters: StayFilterOption[]
  activeFilter: StayFilter
  items: StayItemView[]
}


const RoomTagMap: Record<string, string> = {
  '0': '独立卫生间',
  '1': '山景房',
  '2': '海景房',
  '3': '家庭房',
  '4': '双床房',
  '5': '大床房',
}

Page<MyStaysState, WechatMiniprogram.IAnyObject>({
  data: {
    filters: [
      { label: '全部', value: 'all' },
      // { label: '待付款', value: 'unpaid' },
      // { label: '待审核', value: 'pending' },
      { label: '待入住', value: 'upcoming' },
      { label: '已入住', value: 'checkedIn' },
      { label: '已退款', value: 'refunded' }
    ],
    activeFilter: 'all',
    items: [],
  },
  onItemTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const biz = e.currentTarget.dataset.biz as string
    if (!biz) return
    smartNavigateTo(`/pages/order/detail?bizOrderNo=${encodeURIComponent(biz)}`)
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    // onShow will handle loading
  },
  async onShow(this: WechatMiniprogram.Page.TrivialInstance) {
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
              : filter === 'refunded'
                ? '6'
                : '4'
    const page = await getMyOrderList(type, '1', '20')
    const list: AppOrderListRespVO[] = (page && page.list) || []
    const items: StayItemView[] = list.map((it) => ({
      id: it.bizOrderNo,
      title: it.title,
      statusText: it.status,
      timeText: `${formatDateToCN(it.checkInDate)}-${formatDateToCN(it.checkOutDate)}`,
      address: '龙潭民宿',
      showPayButton: type === '1' || (type === '5' && Number(it.status) === 0),
      showCancelButton: type === '2' || type === '3',
      amount: it.amountTotal || 0,
      roomImage: it.roomImage || '',
      tags: String(it.rootTags || '')
        .split(',')
        .map((t) => RoomTagMap[t] || t)
        .join(' | '),
    }))
    this.setData({
      items,
    })
  },
  onBackTap() {
    goBack()
  },
  async onPayTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const biz = e.currentTarget.dataset.biz as string
    const amount = Number(e.currentTarget.dataset.amount || 0)
    if (!biz || !amount) {
      wx.showToast({ title: '缺少订单信息', icon: 'none' })
      return
    }
    try {
      const resp = await generatePayParams({ bizOrderNo: biz, amount })
      const p = resp && resp.payParams
      if (!p) {
        wx.showToast({ title: '支付参数缺失', icon: 'none' })
        return
      }
      wx.requestPayment({
        timeStamp: p.timeStamp,
        nonceStr: p.nonceStr,
        package: p.packageData,
        signType: p.signType as any,
        paySign: p.paySign,
        success: () => {
          wx.showToast({ title: '支付成功', icon: 'success' })
          this.loadStays()
        },
        fail: () => {
          wx.showToast({ title: '支付未完成', icon: 'none' })
        },
      } as any)
    } catch {
      wx.showToast({ title: '支付失败', icon: 'none' })
    }
  },
  async onCancelTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const biz = e.currentTarget.dataset.biz as string
    if (!biz) {
      wx.showToast({ title: '缺少订单信息', icon: 'none' })
      return
    }
    wx.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？',
      success: async (res) => {
        if (!res.confirm) return
        wx.showToast({ title: '取消功能待接入', icon: 'none' })
      },
    })
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
