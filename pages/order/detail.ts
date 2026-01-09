import { getOrderDetail, cancelOrder } from '../../api/order'
import type { AppOrderDetailRespVO } from '../../model/order'
import { goBack } from '../../utils/navigation'
import { formatYMDHM, formatYMD1 } from '../../utils/date'

interface OrderDetailView {
  statusText: string
  statusClass: string
  hintText: string
  amountText: string
  title: string
  address: string
  checkInText: string
  checkOutText: string
  nightsText: string
  contactName: string
  contactPhone: string
  orderNo: string
  createTime: string
  showCancelButton: boolean
}

function mapPaymentStatusText(status: number): string {
  if (status === 0) return '待支付'
  if (status === 1) return '支付中'
  if (status === 2) return '支付成功'
  if (status === 3) return '支付失败'
  if (status === 4) return '已关闭'
  return ''
}

function weekText(dateStr: string): string {
  const d = new Date(dateStr)
  const w = d.getDay()
  return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][w] || ''
}

Page({
  data: {
    view: null as OrderDetailView | null,
    hasHint: false,
    canCancel: false,
    showCancelModal: false,
    cancelReasons: [] as string[],
    selectedReasonIndex: -1,
  },
  onBackTap() {
    goBack()
  },
  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const bizOrderNo = options.bizOrderNo as string
    if (!bizOrderNo) {
      wx.showToast({ title: '缺少订单号', icon: 'none' })
      return
    }
    this.fetchOrderDetail(bizOrderNo)
  },
  async fetchOrderDetail(bizOrderNo: string) {
    const detail: AppOrderDetailRespVO = await getOrderDetail(bizOrderNo)
    const statusText = mapPaymentStatusText(detail.status)
    const isAccommodation = detail.bizType === 1
    const acc = detail.accommodation
    const title = detail.title || `${acc?.homestayName || ''}-${acc?.roomName || ''}`
    const address = acc?.homestayAddress || ''
    const inDate = acc?.checkInDate || ''
    const outDate = acc?.checkOutDate || ''
    const nights = acc?.nights || 0
    const view: OrderDetailView = {
      statusText,
      statusClass: detail.status === 2 ? 'success' : detail.status === 0 ? 'pending' : 'default',
      hintText:
        isAccommodation && detail.status === 2
          ? '等待DAOI龙潭民宿管家进行审核，审核完成我们将以短信的形式通知您。请耐心等待～'
          : detail.status === 0
          ? '请尽快完成支付以保留预订'
          : '',
      amountText: `￥${(detail.amountTotal || 0).toFixed(2)}`,
      title,
      address,
      checkInText: `${formatYMD1(inDate, '月').replace('月', '月')} ${weekText(inDate)}`,
      checkOutText: `${formatYMD1(outDate, '月').replace('月', '月')} ${weekText(outDate)}`,
      nightsText: `共 ${nights} 晚`,
      contactName: detail.contactName || '',
      contactPhone: detail.contactPhone || '',
      orderNo: detail.bizOrderNo || '',
      createTime: formatYMDHM(detail.createTime),
      showCancelButton: detail.status === 0 || detail.status === 2 || detail.status === 1,
    }
    
    const cancelReasons = [
      '行程取消',
      '订错日期/房型',
      '我的入住信息填错了',
      '其他'
    ]

    this.setData({
      view,
      hasHint: !!view.hintText,
      canCancel: !!view.showCancelButton,
      cancelReasons,
      selectedReasonIndex: -1,
      showCancelModal: false
    })
  },
onCancelTap() {
  this.setData({ showCancelModal: true })
},
closeCancelModal() {
  this.setData({ showCancelModal: false })
},
preventBubble() {},
onReasonSelect(e: WechatMiniprogram.TouchEvent) {
  const index = e.currentTarget.dataset.index
  this.setData({ selectedReasonIndex: index })
},
async onConfirmCancel() {
    const { selectedReasonIndex, cancelReasons, view } = this.data
    if (selectedReasonIndex < 0) {
      wx.showToast({ title: '请选择取消原因', icon: 'none' })
      return
    }
    const reason = cancelReasons[selectedReasonIndex]
    const bizOrderNo = view?.orderNo
    
    if (!bizOrderNo) return

    try {
      await cancelOrder({ bizOrderNo, reason })
      wx.showToast({ title: '取消申请已提交', icon: 'success' })
      this.closeCancelModal()
      this.fetchOrderDetail(bizOrderNo)
    } catch (err) {
      console.error(err)
    }
  },
})
