import type { Activity, ActivityCollection, ActivityDetail, ActivityRegistration, ActivityShareInfo } from '../model/activity'
import { ActivityType, ActivityTypeLabel } from '../model/activity'
import { PageResult } from '../model/common'
import { getData, postData } from '../utils/request'
import { formatYMDHM } from '../utils/date'

export interface ActivityListParams {
  collectionId?: string
  spaceId?: string
  activityType?: string
  pageNo: string
  pageSize: string
}

export interface CreateActivityCollectionPayload {
  name: string
  logo: string
  description: string
}

export interface CreateActivityPayload {
  title: string
  collectionId?: number | string
  fee?: number
  isFree: boolean
  activityType: number
  startTime: string
  endTime: string
  spaceName: string
  detail: string
  logo: string
  limit?: number
}

export function getActivityList(
  params: ActivityListParams
): Promise<PageResult<Activity>> {
  return getData<PageResult<Activity>>(
    '/app-api/daolongtan/activity/list',
    params
  )
}

export function getMyActivityList(
  type: string,
  pageNo: string,
  pageSize: string
): Promise<PageResult<Activity>> {
  return getData<PageResult<Activity>>(
    '/app-api/daolongtan/activity/my-list',
    { type, pageNo, pageSize }
  )
}

export function getActivityCollections(
  pageNo: string,
  pageSize: string,
  creatorId?: string
): Promise<PageResult<ActivityCollection>> {
  return getData<PageResult<ActivityCollection>>(
    '/app-api/daolongtan/activity-collection/list',
    { pageNo, pageSize, creatorId }
  )
}

export function getMyActivityCollections(
  pageNo: string,
  pageSize: string
): Promise<PageResult<ActivityCollection>> {
  return getData<PageResult<ActivityCollection>>(
    '/app-api/daolongtan/activity-collection/my-list',
    { pageNo, pageSize }
  )
}

export function createActivity(
  payload: CreateActivityPayload
): Promise<boolean> {
  return postData<boolean>(
    '/app-api/daolongtan/activity/create',
    payload
  )
}

export function createActivityCollection(
  payload: CreateActivityCollectionPayload
): Promise<boolean> {
  return postData<boolean>(
    '/app-api/daolongtan/activity-collection/create',
    payload
  )
}

export function getActivityRegistrations(
  activityId: number
): Promise<ActivityRegistration> {
  return getData<ActivityRegistration>(
    '/app-api/daolongtan/activity/registration',
    { activityId: String(activityId) }
  )
}

export async function getActivityByIdFromList(
  id: number
): Promise<Activity | undefined> {
  const page = await getActivityList({
    pageNo: '1',
    pageSize: '100',
  })
  const it = page.list.find((x) => x.id === id)
  if (!it) return undefined
  return {
    ...it,
    poster: {
      id: String(it.id),
      url: it.logo || '/assets/images/activity.jpg',
    },
    secondaryTag: (() => {
      const raw = (it as any).activityType
      let name = ''
      if (raw !== undefined && raw !== null && raw !== '') {
        const s = String(raw)
        const isNum = typeof raw === 'number' || /^\d+$/.test(s)
        if (isNum) {
          const n = Number(raw) as ActivityType
          name = ActivityTypeLabel[n] ?? ''
        } else {
          name = s
        }
      }
      return {
        name: name || it.collectionName || '活动',
      }
    })(),
    timeRange: {
      startTime: formatYMDHM(it.startTime) || '',
      endTime: formatYMDHM(it.endTime) || '',
    },
    price: {
      amount: it.fee || 0,
      currency: 'CNY',
      unit: '人',
    },
    space: {
      id: it.spaceId,
      name: it.spaceName || '',
      address: '',
      mapImages: [],
    },
    detail: it.detail || '',
  }
}

export async function getActivityDetail(id: number): Promise<ActivityDetail> {
  return getData<ActivityDetail>(
    '/app-api/daolongtan/activity/detail',
    { id: String(id) }
  )
}

export function getFavoriteCount(activityId: number): Promise<number> {
  return getData<number>('/app-api/daolongtan/activity/favorite-count', {
    activityId,
  })
}

export function favoriteActivity(activityId: number): Promise<boolean> {
  return postData<boolean>(
    `/app-api/daolongtan/activity/favorite?activityId=${activityId}`,
    { activityId },
    { 'content-type': 'application/x-www-form-urlencoded' }
  )
}

export function unfavoriteActivity(activityId: number): Promise<boolean> {
  return postData<boolean>(
    `/app-api/daolongtan/activity/unfavorite?activityId=${activityId}`,
    { activityId },
    { 'content-type': 'application/x-www-form-urlencoded' }
  )
}

export function shareActivity(activityId: number): Promise<ActivityShareInfo> {
  return postData<ActivityShareInfo>(
    `/app-api/daolongtan/activity/share?activityId=${activityId}`,
    { activityId },
    { 'content-type': 'application/x-www-form-urlencoded' }
  )
}
