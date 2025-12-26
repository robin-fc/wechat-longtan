import type { Activity, ActivityCollection } from '../model/activity'
import { getData } from '../utils/request'

export interface ActivityListParams {
  collectionId?: string
  spaceId?: string
  activityType?: string
  pageNo: string
  pageSize: string
}

export interface PageResult<T> {
  total: number
  list: T[]
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
