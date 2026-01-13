import type { UserProfile } from '../model/user'
import type { ActivityCollection, Activity } from '../model/activity'
import { ensureActivityTypeDict } from './activity'
import { getData } from '../utils/request'
import { getMyActivityList, getMyActivityCollections } from './activity'
import type { PageResult } from '../model/common'
import type { HomestayApplication } from '../model/homestay'
import { fetchHomestayApplications } from './homestay'
import type { AssetDetailResult } from '../model/wallet'
import { formatYMDHM } from '../utils/date'

export interface MyActivityFilter {
  id: string
  name: string
  type?: string
}

export interface MyStayFilter {
  id: string
  name: string
}

export interface UserSummary {
  followingCount: number
  followerCount: number
  asset: number
}

export function fetchMyProfile(): Promise<UserProfile> {
  return getData<UserProfile>('/app-api/daolongtan/user/get-info')
}

export function fetchUserSummary(): Promise<UserSummary> {
  return getData<UserSummary>('/app-api/daolongtan/user/summary')
}

export function fetchWalletRecords(
  type: number,
  pageNo: number,
  pageSize: number,
  month?: string
): Promise<AssetDetailResult> {
  return getData<AssetDetailResult>(
    '/app-api/daolongtan/user/asset/detail',
    {
      type,
      pageNo,
      pageSize,
      month,
    }
  )
}

export async function fetchMyActivities(
  type: string
): Promise<Activity[]> {
  const page: PageResult<Activity> = await getMyActivityList(
    type,
    '1',
    '20'
  )
  const list = (page && page.list) || []
  return list.map((it) => ({
    ...it,
    timeRange: {
      startTime: formatYMDHM(it.startTime),
      endTime: formatYMDHM(it.endTime),
    },
    price: {
      amount: it.fee || 0,
      currency: 'CNY',
      unit: '人',
    },
    companions: {
      companions: [],
      totalCount: 0,
    },
    space: {
      id: it.spaceId,
      name: it.spaceName,
      address: '',
      mapImages: [],
    },
  }))
}

export async function fetchMyCollections(): Promise<ActivityCollection[]> {
  const page: PageResult<ActivityCollection> =
  await getMyActivityCollections('1', '20')
  const list = (page && page.list) || []
  return list
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
