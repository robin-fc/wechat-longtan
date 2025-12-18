import { fetchHomestayApplications } from '../../api/homestay'
import type { HomestayApplication } from '../../model/homestay'
import { goBack } from '../../utils/navigation'

interface ApplicationView {
  id: string
  statusText: string
  statusClass: string
  priceText: string
  title: string
  timeText: string
  guestName: string
  phone: string
  canCancel: boolean
}

interface ApplyStatusState {
  applications: ApplicationView[]
}

function mapStatusText(status: HomestayApplication['status']): string {
  if (status === 'pending') {
    return '待审核'
  }
  if (status === 'confirmed') {
    return '预定成功'
  }
  if (status === 'checkedIn') {
    return '已入住'
  }
  return '已取消'
}

Page<ApplyStatusState, WechatMiniprogram.IAnyObject>({
  data: {
    applications: [],
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    const list = await fetchHomestayApplications()
    const views: ApplicationView[] = list.map((item) => ({
      id: item.id,
      statusText: mapStatusText(item.status),
      statusClass: item.status,
      priceText: `${item.totalPrice.amount}${item.totalPrice.unit || ''}`,
      title: `申请民宿 ${item.homestayId} 房间 ${item.roomId}`,
      timeText: `${item.stayRange.startTime} ~ ${item.stayRange.endTime}`,
      guestName: item.applicantName,
      phone: item.phone,
      canCancel: item.status === 'pending' || item.status === 'confirmed',
    }))
    this.setData({
      applications: views,
    })
  },
  onBackTap() {
    goBack()
  },
  onCancelTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const id = e.currentTarget.dataset.id as string
    const list = (this.data as ApplyStatusState).applications.slice()
    const index = list.findIndex((item) => item.id === id)
    if (index === -1) {
      return
    }
    wx.showModal({
      title: '取消订单',
      content: '确定要取消该申请吗？',
      success: (res) => {
        if (res.confirm) {
          list[index] = {
            ...list[index],
            statusText: '已取消',
            statusClass: 'canceled',
            canCancel: false,
          }
          this.setData({
            applications: list,
          })
        }
      },
    })
  },
})
