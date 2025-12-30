import type { Activity, ActivityCollection, ActivityDetail, ActivityRegistration, ActivityShareInfo } from '../model/activity'
import { ActivityType, ActivityTypeLabel } from '../model/activity'
import { PageResult } from '../model/common'
import { getData, postData } from '../utils/request'

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
  posterUrl: string
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
  const formatDate = (v: any): string => {
    if (v === undefined || v === null) return ''
    const s = String(v)
    const isNum = typeof v === 'number' || /^\d+$/.test(s)
    if (isNum) {
      const d = new Date(Number(v))
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}/${m}/${day}`
    }
    return s
  }
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
      startTime: formatDate(it.startTime) || '',
      endTime: formatDate(it.endTime) || '',
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

export function getFavoriteCount(id: number): Promise<number> {
  return getData<number>(
    '/app-api/daolongtan/favorite/count',
    { bizId: String(id), type: '1' } // 1 for Activity
  )
}

export function favoriteActivity(id: number): Promise<boolean> {
  return postData<boolean>(
    '/app-api/daolongtan/favorite/create',
    { bizId: id, type: 1 }
  )
}

export function unfavoriteActivity(id: number): Promise<boolean> {
  return postData<boolean>(
    '/app-api/daolongtan/favorite/delete',
    { bizId: id, type: 1 }
  )
}

export function shareActivity(id: number): Promise<ActivityShareInfo> {
  return getData<ActivityShareInfo>(
    '/app-api/daolongtan/activity/share-info',
    { id: String(id) }
  )
}
