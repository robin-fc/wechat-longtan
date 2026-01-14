import { PageResult } from '../model/common'
import { getData, postData } from '../utils/request'
import type { ActivityCollection, CreateActivityCollectionPayload } from '../model/activity-collection'

const baseUrl = '/app-api/daolongtan/activity-collection'

export function getActivityCollections(
  pageNo: string,
  pageSize: string,
  creatorId?: string,
  keyword?: string
): Promise<PageResult<ActivityCollection>> {
  return getData<PageResult<ActivityCollection>>(`${baseUrl}/list`, {
    pageNo,
    pageSize,
    creatorId,
    keyword,
  })
}

export function getMyActivityCollections(
  pageNo: string,
  pageSize: string
): Promise<PageResult<ActivityCollection>> {
  return getData<PageResult<ActivityCollection>>(
    `${baseUrl}/my-list`,
    { pageNo, pageSize }
  )
}

export function createActivityCollection(
  payload: CreateActivityCollectionPayload
): Promise<boolean> {
  return postData<boolean>(`${baseUrl}/create`, payload)
}
