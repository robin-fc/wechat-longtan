import type { WalletRecordType, WalletRecord } from '../../model/wallet'
import { fetchWalletRecords } from '../../api/mine'
import { goBack } from '../../utils/navigation'

interface FilterOption {
  label: string
  value: 'all' | WalletRecordType
}

interface RecordGroup {
  month: string
  items: WalletRecord[]
}

interface AssetsState {
  filters: FilterOption[]
  activeFilter: FilterOption['value']
  groups: RecordGroup[]
}

const FilterTypeMap: Record<string, number> = {
  all: 0,
  income: 1,
  expense: 2,
  refund: 3,
}

Page<AssetsState, WechatMiniprogram.IAnyObject>({
  data: {
    filters: [
      { label: '全部', value: 'all' },
      { label: '收入', value: 'income' },
      { label: '支出', value: 'expense' },
      { label: '退款', value: 'refund' },
    ],
    activeFilter: 'all',
    groups: [],
  },
  async onLoad(this: WechatMiniprogram.Page.TrivialInstance) {
    await this.loadRecords()
  },
  async loadRecords(
    this: WechatMiniprogram.Page.TrivialInstance
  ) {
    const filter = (this.data as AssetsState).activeFilter
    const type = FilterTypeMap[filter] ?? 0
    const res = await fetchWalletRecords(type, 1, 20).catch(() => null)
    
    if (!res || !res.monthSummaries) {
      this.setData({ groups: [] })
      return
    }

    const groups: RecordGroup[] = res.monthSummaries.map((summary: { monthDisplayName: any; transactions: any[]; month: any }) => ({
      month: summary.monthDisplayName, // 或者使用 summary.month 如果 UI 需要 '2026-01'
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
    })
  },
  onBackTap() {
    goBack()
  },
  async onFilterTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const value = e.currentTarget.dataset.value as FilterOption['value']
    this.setData({
      activeFilter: value,
    })
    await this.loadRecords()
  },
})
