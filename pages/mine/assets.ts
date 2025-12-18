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

interface AssetsState {
  filters: FilterOption[]
  activeFilter: FilterOption['value']
  groups: RecordGroup[]
}

Page<AssetsState>({
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
    const all = await fetchWalletRecords()
    const filter = (this.data as AssetsState).activeFilter
    const list =
      filter === 'all'
        ? all
        : all.filter((item) => item.type === filter)
    const groupsMap: { [key: string]: typeof all } = {}
    list.forEach((item) => {
      if (!groupsMap[item.month]) {
        groupsMap[item.month] = []
      }
      groupsMap[item.month].push(item)
    })
    const groups: RecordGroup[] = Object.keys(groupsMap).map((month) => ({
      month,
      items: groupsMap[month],
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
