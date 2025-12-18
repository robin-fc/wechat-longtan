import type { ID, Price, TimeRange } from './common'

export type ActivityOrderStatus = 'unpaid' | 'paid' | 'canceled'

export interface ActivityOrder {
  id: ID
  activityId: ID
  title: string
  spaceName: string
  timeRange: TimeRange
  participantName: string
  participantPhone: string
  notice?: string
  status: ActivityOrderStatus
  totalPrice: Price
}

