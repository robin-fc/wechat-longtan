import { getMyOrderList, generatePayParams } from '../../api/order'
import type { AppOrderListRespVO } from '../../model/order'
import { goBack, smartNavigateTo } from '../../utils/navigation'
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
  showPayButton: boolean
  showCancelButton: boolean
  amount: number
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
        : '4'
    const page = await getMyOrderList(type, '1', '20')
    const list: AppOrderListRespVO[] = (page && page.list) || []
    const items: StayItemView[] = list.map((it) => ({
      id: it.bizOrderNo,
      title: it.title,
      statusText: mapPaymentStatusText(it.status),
      timeText: `${formatYMDHM(it.checkInDate)} ~ ${formatYMDHM(it.checkOutDate)}`,
      address: '龙潭民宿',
      showPayButton: type === '1' || (type === '5' && it.status === 0),
      showCancelButton: type === '2' || type === '3',
      amount: it.amountTotal || 0,
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
