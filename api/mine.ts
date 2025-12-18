import type { UserProfile } from '../model/user'
import type { WalletRecord } from '../model/wallet'
import type { Activity } from '../model/activity'
import type { HomestayApplication } from '../model/homestay'
import type { ID } from '../model/common'
import { fetchHomeData } from './home'
import { fetchHomestayApplications } from './homestay'

export interface MyActivityFilter {
  id: ID
  name: string
}

export interface MyStayFilter {
  id: ID
  name: string
}

export async function fetchMyProfile(): Promise<UserProfile | undefined> {
  const home = await fetchHomeData()
  return home.currentUser
}

export function fetchWalletRecords(): Promise<WalletRecord[]> {
  const records: WalletRecord[] = [
    {
      id: 'wallet-1',
      type: 'income',
      createdAt: '2025-01-10 14:20',
      title: '活动报名收入',
      description: '进山路徒步活动报名',
      amount: {
        amount: 199,
        currency: 'CNY',
      },
      month: '2025-01',
    },
    {
      id: 'wallet-2',
      type: 'expense',
      createdAt: '2025-01-05 09:12',
      title: '报名活动支出',
      description: '龙潭剪纸体验报名',
      amount: {
        amount: 199,
        currency: 'CNY',
      },
      month: '2025-01',
    },
  ]
  return Promise.resolve(records)
}

export async function fetchMyActivities(): Promise<Activity[]> {
  const home = await fetchHomeData()
  return home.hotActivities
}

export async function fetchMyStays(): Promise<HomestayApplication[]> {
  return fetchHomestayApplications()
}

export function fetchMyActivityFilters(): MyActivityFilter[] {
  return [
    { id: 'joined', name: '我参与的' },
    { id: 'published', name: '我发布的' },
    { id: 'collected', name: '我收藏的' },
    { id: 'to-comment', name: '待评价' },
    { id: 'collections', name: '活动合集' },
  ]
}

export function fetchMyStayFilters(): MyStayFilter[] {
  return [
    { id: 'all', name: '全部' },
    { id: 'unpaid', name: '待付款' },
    { id: 'pending', name: '待审核' },
    { id: 'upcoming', name: '待入住' },
    { id: 'checked-in', name: '已入住' },
  ]
}
