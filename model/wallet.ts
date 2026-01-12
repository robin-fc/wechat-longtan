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

export interface WalletTransaction {
  description: string
  type: number
  typeDisplayName: string
  amount: string
  amountValue: number
  transactionTime: string
}

export interface MonthSummary {
  month: string
  monthDisplayName: string
  income: number
  expense: number
  transactions: WalletTransaction[]
}

export interface AssetDetailResult {
  totalAsset: number
  monthSummaries: MonthSummary[]
}

