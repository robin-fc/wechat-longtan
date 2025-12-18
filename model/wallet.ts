import type { ID, Price } from './common'

export type WalletRecordType = 'income' | 'expense' | 'refund'

export interface WalletRecord {
  id: ID
  type: WalletRecordType
  createdAt: string
  title: string
  description?: string
  amount: Price
  month: string
}

