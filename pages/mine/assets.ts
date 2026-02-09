import type { WalletRecordType, WalletRecord } from '../../model/wallet'
import { fetchWalletRecords } from '../../api/mine'
import { goBack } from '../../utils/navigation'

interface RecordGroup {
  month: string
  income: number
  expense: number
  collapsed: boolean
  items: WalletRecord[]
}

interface AssetsState {
  groups: RecordGroup[]
  totalAsset: number
}

Page<AssetsState, WechatMiniprogram.IAnyObject>({
  data: {
    groups: [],
    totalAsset: 0,
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    await this.loadRecords()
  },
  async loadRecords(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    // 获取全部记录，type=0 表示全部
    const res = await fetchWalletRecords(0, 1, 100).catch(() => null)
    
    if (!res || !res.monthSummaries) {
      this.setData({ groups: [], totalAsset: 0 })
      return
    }

    const groups: RecordGroup[] = res.monthSummaries.map((summary) => ({
      month: summary.monthDisplayName,
      income: summary.income,
      expense: summary.expense,
      collapsed: false,
      items: summary.transactions.map((tx) => ({
        // Map WalletTransaction to WalletRecord
        id: '', // 新数据无ID
        type: (tx.type === 1 ? 'income' : tx.type === 2 ? 'expense' : 'refund') as WalletRecordType,
        createdAt: tx.transactionTime,
        title: tx.description,
        description: tx.typeDisplayName,
        amount: {
          amount: tx.amountValue,
          currency: 'CNY',
          unit: '元'
        },
        month: summary.month
      }))
    }))

    this.setData({
      groups,
      totalAsset: res.totalAsset,
    })
  },
  onBackTap() {
    goBack()
  },
  onToggleMonth(e: WechatMiniprogram.BaseEvent) {
    const index = e.currentTarget.dataset.index
    const groups = this.data.groups as RecordGroup[]
    const key = `groups[${index}].collapsed`
    this.setData({
      [key]: !groups[index].collapsed
    })
  },
})
