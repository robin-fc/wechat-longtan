import type { UserProfile } from '../model/user'
import type { ActivityCollection, Activity } from '../model/activity'
import { getData } from '../utils/request'
import { getMyActivityList, getMyActivityCollections } from './activity'
import type { PageResult } from './activity'
import type { HomestayApplication } from '../model/homestay'
import { fetchHomestayApplications } from './homestay'
import type { WalletRecord } from '../model/wallet'

export interface MyActivityFilter {
  id: string
  name: string
  type?: string
}

export interface MyStayFilter {
  id: string
  name: string
}

export function fetchMyProfile(): Promise<UserProfile> {
  return getData<UserProfile>('/app-api/daolongtan/user/get-info')
}

export function fetchWalletRecords(): Promise<WalletRecord[]> {
  return Promise.resolve([])
}

export async function fetchMyActivities(
  type: string
): Promise<Activity[]> {
  const page: PageResult<Activity> = await getMyActivityList(
    type,
    '1',
    '20'
  )
  return page.list
}

export async function fetchMyCollections(): Promise<ActivityCollection[]> {
  const page: PageResult<ActivityCollection> =
    await getMyActivityCollections('1', '20')
  return page.list
}

export async function fetchMyStays(): Promise<HomestayApplication[]> {
  return fetchHomestayApplications()
}

export function fetchMyActivityFilters(): MyActivityFilter[] {
  return [
    { id: 'joined', name: '我参与的', type: '1' },
    { id: 'published', name: '我发布的', type: '2' },
    { id: 'collected', name: '我收藏的', type: '3' },
    { id: 'to-comment', name: '待评价', type: '4' },
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
