import type { ActivityOrder } from '../model/order'

export function createActivityOrder(
  order: ActivityOrder
): Promise<ActivityOrder> {
  return Promise.resolve(order)
}

