import type { Activity, ActivityCollection, ActivityDetail, ActivityRegistration, ActivityShareInfo } from '../model/activity'
import { ActivityType, ActivityTypeLabel } from '../model/activity'
import { PageResult } from '../model/common'
import { getData, postData } from '../utils/request'
import { formatYMDHM } from '../utils/date'

export interface ActivityListParams {
  collectionId?: string
  spaceId?: string
  activityType?: string
  keyword?: string
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

export interface ActivityListResponse {
  pageResult: PageResult<Activity>
  onSaleCount: number
  detail?: string
}

export function getActivityList(
  params: ActivityListParams
): Promise<ActivityListResponse> {
  return getData<ActivityListResponse>(
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
  creatorId?: string,
  keyword?: string
): Promise<PageResult<ActivityCollection>> {
  return getData<PageResult<ActivityCollection>>(
    '/app-api/daolongtan/activity-collection/list',
    { pageNo, pageSize, creatorId, keyword }
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
  const res = await getActivityList({
    pageNo: '1',
    pageSize: '100',
  })
  const it = res.pageResult.list.find((x) => x.id === id)
  if (!it) return undefined
  return {
    ...it,
    logo:  it.logo,
      startTime: formatYMDHM(it.startTime) || '',
      endTime: formatYMDHM(it.endTime) || '',
    detail: it.detail || '',
  }
}

export async function getActivityDetail(id: number): Promise<ActivityDetail> {
  const data = await getData<ActivityDetail>(
    '/app-api/daolongtan/activity/detail',
    { id: String(id) }
  )
  // Mock organizer extra info if missing
  if (data && data.organizer) {
    if (!data.organizer.tags) {
      data.organizer.tags = ''
    }
    if (!data.organizer.spaceName) {
      data.organizer.spaceName = ''
    }
  }
  return data
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
