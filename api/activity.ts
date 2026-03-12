import type {
  Activity,
  ActivityType,
  ActivityDetail,
  ActivityRegistration,
  ActivityShareInfo,
  ActivityListParams,
  ActivityListResponse,
  UserActivityListParams,
  CreateActivityPayload,
  UpdateActivityPayload,
} from '../model/activity'
import { PageResult } from '../model/common'
import { getData, postData } from '../utils/request'

export interface AppReviewCreateReqVO {
  targetId: number
  type: number // 0=Activity, 1=Homestay
  content: string
  rating?: number
  images?: string[]
}

export interface AppReviewRespVO {
  id: number
  userId: number
  user: {
    userId: number
    logo: string
    wxName: string
    memberName: string
    introduction: string
    memberLevel: string
    memberTags: string[]
    followed: boolean
  }
  rating: number
  content: string
  images: string[]
  createTime: string
}

export interface AppReviewListReqVO {
  targetType: string // '0': 活动, '1': 住宿房间
  targetId: string
  pageNo: string
  pageSize: string
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

export function updateActivity(
  payload: UpdateActivityPayload
): Promise<boolean> {
  return postData<boolean>(`${baseUrl}/update`, payload)
}

export function getActivityRegistrations(
  activityId: number
): Promise<ActivityRegistration> {
  return getData<ActivityRegistration>(`${baseUrl}/registration`, {
    activityId: String(activityId),
  })
}

export async function getActivityDetail(id: number): Promise<ActivityDetail> {
  const data = await getData<ActivityDetail>(`${baseUrl}/detail`, {
    id: String(id),
  })
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

export function createReview(payload: AppReviewCreateReqVO): Promise<boolean> {
  return postData<boolean>('/app-api/daolongtan/review/create', payload)
}

export function getReviewList(params: AppReviewListReqVO): Promise<PageResult<AppReviewRespVO>> {
  return getData<PageResult<AppReviewRespVO>>('/app-api/daolongtan/review/list', params)
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
