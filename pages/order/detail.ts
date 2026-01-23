import { getOrderDetail, cancelOrder, generatePayParams } from '../../api/order'
import type { AppOrderDetailRespVO } from '../../model/order'
import { goBack } from '../../utils/navigation'
import { formatYMDHM, formatYMD1, parseToDate } from '../../utils/date'

interface OrderDetailView {
  statusText: string
  statusClass: string
  hintText: string
  amountText: string
  amount: number
  title: string
  address: string
  checkInText: string
  checkOutText: string
  nightsText: string
  contactName: string
  contactPhone: string
  orderNo: string
  createTime: string
  showPayButton: boolean
  showCancelButton: boolean
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
    canPay: false,
    showCancelModal: false,
    cancelReasons: [] as string[],
    selectedReasonIndex: -1,
    countdownText: '',
  },
  timer: null as number | null,
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
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
    const statusText = detail.status
    const isAccommodation = detail.bizType === 1
    const acc = detail.accommodation
    const title = detail.title || `${acc?.homestayName || ''}-${acc?.roomName || ''}`
    const address = acc?.homestayAddress || ''
    const inDate = acc?.checkInDate || ''
    const outDate = acc?.checkOutDate || ''
    const nights = acc?.nights || 0

    const createDate = parseToDate(detail.createTime)
    let isWithin24Hours = false
    let isWithin10Minutes = false
    let countdownText = ''

    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    if (createDate) {
      const now = Date.now()
      const diff = now - createDate.getTime()
      isWithin24Hours = diff < 24 * 60 * 60 * 1000
      isWithin10Minutes = diff < 10 * 60 * 1000

      if ((detail.status === '待支付' || detail.status === '支付中') && isWithin10Minutes) { // 待支付且在10分钟内
        const expireTime = createDate.getTime() + 10 * 60 * 1000
        const updateCountdown = () => {
          const remaining = expireTime - Date.now()
          if (remaining <= 0) {
            this.setData({ countdownText: '', canPay: false })
            if (this.timer) {
              clearInterval(this.timer)
              this.timer = null
            }
            // 倒计时结束，可能需要刷新页面状态
            this.fetchOrderDetail(bizOrderNo)
            return
          }
          const m = Math.floor(remaining / 60000)
          const s = Math.floor((remaining % 60000) / 1000)
          this.setData({
            countdownText: `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
          })
        }
        updateCountdown()
        this.timer = setInterval(updateCountdown, 1000) as unknown as number
      }
    }

    // Status class mapping
    let statusClass = 'default'
    if (detail.status === '支付成功') statusClass = 'success'
    else if (detail.status === '待支付') statusClass = 'pending'

    // Hint text logic
    let hintText = ''
    if (isAccommodation && detail.status === '支付成功') {
      hintText = '等待DAOI龙潭民宿管家进行审核，审核完成我们将以短信的形式通知您。请耐心等待～'
    } else if (detail.status === '待支付') {
      hintText = '请尽快完成支付以保留预订'
    }

    const showPayButton = (detail.status === '待支付' || detail.status === '支付中') && isWithin10Minutes
    const showCancelButton = (detail.status === '待支付' || detail.status === '支付中' || detail.status === '支付成功') && isWithin24Hours

    const view: OrderDetailView = {
      statusText,
      statusClass,
      hintText,
      amountText: `￥${(detail.amountTotal || 0).toFixed(2)}`,
      amount: detail.amountTotal || 0,
      title,
      address,
      checkInText: `${formatYMD1(inDate, '月').replace('月', '月')} ${weekText(inDate)}`,
      checkOutText: `${formatYMD1(outDate, '月').replace('月', '月')} ${weekText(outDate)}`,
      nightsText: `共 ${nights} 晚`,
      contactName: detail.contactName || '',
      contactPhone: detail.contactPhone || '',
      orderNo: detail.bizOrderNo || '',
      createTime: formatYMDHM(detail.createTime),
      showPayButton,
      showCancelButton,
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
      canPay: !!view.showPayButton,
      cancelReasons,
      selectedReasonIndex: -1,
      showCancelModal: false
    })
  },
  async onPayTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const view = this.data.view as OrderDetailView | null
    const bizOrderNo = view?.orderNo
    const amount = Number(view?.amount || 0)
    if (!bizOrderNo || !amount) {
      wx.showToast({ title: '缺少订单信息', icon: 'none' })
      return
    }
    try {
      const resp = await generatePayParams({ bizOrderNo, amount })
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
          this.fetchOrderDetail(bizOrderNo)
        },
        fail: () => {
          wx.showToast({ title: '支付未完成', icon: 'none' })
        },
      } as any)
    } catch {
      wx.showToast({ title: '支付失败', icon: 'none' })
    }
  },
  onCancelTap() {
    this.setData({ showCancelModal: true })
  },
  closeCancelModal() {
    this.setData({ showCancelModal: false })
  },
  preventBubble() { },
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
