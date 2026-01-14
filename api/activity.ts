import type {
  Activity,
  ActivityType,
  ActivityDetail,
  ActivityRegistration,
  ActivityShareInfo,
} from '../model/activity'
import { PageResult } from '../model/common'
import { getData, postData } from '../utils/request'
import { formatYMDHM } from '../utils/date'

export interface ActivityListParams {
  collectionId?: string
  spaceId?: string
  activityType?: string
  onlyOnSale?: boolean
  name?: string //活动标题（模糊搜索）,示例值(摄影)
  pageNo: string
  pageSize: string
}

export interface CreateActivityPayload {
  title: string
  logo: string
  fee: number
  isFree: boolean
  startTime: string
  endTime: string
  spaceId: number | string
  collectionId?: number | string
  activityType?: string
  maxParticipants?: number
  detail?: string
  isLimitParticipants?: boolean
}

export interface ActivityListResponse {
  pageResult: PageResult<Activity>
  onSaleCount: number
}

export interface UserActivityListParams {
  userId: string
  type: number | string
  pageNo: number | string
  pageSize: number | string
}

const baseUrl = '/app-api/daolongtan/activity'

export function getActivityList(
  params: ActivityListParams
): Promise<ActivityListResponse> {
  return getData<ActivityListResponse>(`${baseUrl}/list`, params)
}

export function getMyActivityList(
  type: string,
  pageNo: string,
  pageSize: string
): Promise<PageResult<Activity>> {
  return getData(`${baseUrl}/my-list`, {
    type,
    pageNo,
    pageSize,
  })
}

export function getUserActivityList(
  params: UserActivityListParams
): Promise<any> {
  return getData(`${baseUrl}/user-list`, params)
}

export function createActivity(
  payload: CreateActivityPayload
): Promise<boolean> {
  return postData<boolean>(`${baseUrl}/create`, payload)
}

export function getActivityRegistrations(
  activityId: number
): Promise<ActivityRegistration> {
  return getData<ActivityRegistration>(`${baseUrl}/registration`, {
    activityId: String(activityId),
  })
}

export async function getActivityByIdFromList(id: number): Promise<Activity> {
  const res = await getActivityList({
    pageNo: '1',
    pageSize: '100',
  })
  const it = res.pageResult.list.find((x) => x.id === id)
  if (!it) {
    // 从他人页面点进来的活动，有可能不在列表中，需要从详情接口获取
    const activityDetail: ActivityDetail = await getActivityDetail(id)
    if (!activityDetail) {
      throw new Error('Activity not found')
    }
    const active: Activity = {
      ...activityDetail,
      collectionId: activityDetail?.id || 0,
      collectionName: activityDetail?.space?.name || '',
      spaceId: activityDetail.space?.id || 0,
      spaceName: activityDetail.space?.name || '',
      // todo
    }
    return active
  }
  return {
    ...it,
    logo: it.logo,
    detail: it.detail || '',
  }
}

export async function getActivityDetail(id: number): Promise<ActivityDetail> {
  const data = await getData<ActivityDetail>(`${baseUrl}/detail`, {
    id: String(id),
  })
  // Mock organizer extra info if missing
  if (data && data.organizer) {
    if (!data.organizer.memberTags) {
      data.organizer.memberTags = []
    }
  }
  return data
}

export function getFavoriteCount(activityId: number): Promise<number> {
  return getData<number>(`${baseUrl}/favorite-count`, {
    activityId,
  })
}

export function favoriteActivity(activityId: number): Promise<boolean> {
  return postData<boolean>(
    `${baseUrl}/favorite?activityId=${activityId}`,
    { activityId },
    { 'content-type': 'application/x-www-form-urlencoded' }
  )
}

export function unfavoriteActivity(activityId: number): Promise<boolean> {
  return postData<boolean>(
    `${baseUrl}/unfavorite?activityId=${activityId}`,
    { activityId },
    { 'content-type': 'application/x-www-form-urlencoded' }
  )
}

export function shareActivity(activityId: number): Promise<ActivityShareInfo> {
  return postData<ActivityShareInfo>(
    `${baseUrl}/share?activityId=${activityId}`,
    { activityId },
    { 'content-type': 'application/x-www-form-urlencoded' }
  )
}

/**
 * 获取活动类型列表
 * @param {string} onlyRelated 是否只获取系统中活动关联的类型（true=只获取已关联的类型，false/null=获取所有类型）
 * @returns
 */
export function getActivityTypeList(onlyRelated: string): Promise<
  {
    value: string // 活动类型数值
    label: string // 活动类型标签
    logo: string // 活动类型logo地址
  }[]
> {
  return getData<
    {
      value: string // 活动类型数值
      label: string // 活动类型标签
      logo: string // 活动类型logo地址
    }[]
  >(`${baseUrl}/type-list?onlyRelated=${onlyRelated}`)
}

let activityTypeDictCache: ActivityType[] | null = null

export async function ensureActivityTypeDict(): Promise<ActivityType[]> {
  if (activityTypeDictCache) return activityTypeDictCache
  const list = await getActivityTypeList('false')
  activityTypeDictCache = list.slice()
  return list
}

export async function getActivityTypeLabelDynamic(
  value: number | string
): Promise<string> {
  const dict = await ensureActivityTypeDict()
  const key = String(value)
  const item = dict.find((x) => x.value === key)
  return item?.label || key
}
