import type { Activity, ActivityCollection, ActivityDetail, ActivityRegistration, ActivityShareInfo } from '../model/activity'
import { PageResult } from '../model/common'
import { getData, postData } from '../utils/request'

export interface ActivityListParams {
  collectionId?: string
  spaceId?: string
  activityType?: string
  pageNo: string
  pageSize: string
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

export async function getActivityByIdFromList(
  id: number
): Promise<Activity | undefined> {
  const page = await getActivityList({
    pageNo: '1',
    pageSize: '100',
  })
  return page.list.find((it) => it.id === id)
}

export function getActivityDetail(id: number): Promise<ActivityDetail> {
  return getData<ActivityDetail>('/app-api/daolongtan/activity/detail', { id })
}

export function getActivityRegistration(
  activityId: number
): Promise<ActivityRegistration> {
  return getData<ActivityRegistration>(
    '/app-api/daolongtan/activity/registration',
    { activityId }
  )
}

export function getFavoriteCount(activityId: number): Promise<number> {
  return getData<number>('/app-api/daolongtan/activity/favorite-count', {
    activityId,
  })
}

export function favoriteActivity(activityId: number): Promise<boolean> {
  return postData<boolean>(
    `/app-api/daolongtan/activity/favorite?activityId=${activityId}`
  )
}

export function unfavoriteActivity(activityId: number): Promise<boolean> {
  return postData<boolean>(
    `/app-api/daolongtan/activity/unfavorite?activityId=${activityId}`
  )
}

export function shareActivity(activityId: number): Promise<ActivityShareInfo> {
  return postData<ActivityShareInfo>(
    `/app-api/daolongtan/activity/share?activityId=${activityId}`
  )
}
