import { PageResult } from './common'
import { AppUserInfoRespVO } from './user-follow'

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

export interface ActivityType {
  value: string
  label: string
  logo: string
}

export interface Activity {
  /*编号 */
  id: number

  /*活动标题 */
  title: string

  /*活动logo */
  logo: string

  /*所属合集ID */
  collectionId: number

  /*所属合集名称 */
  collectionName: string

  /*费用 */
  fee: number

  /*是否免费（false收费 true免费） */
  isFree: boolean

  /*活动类型（标签文本：摄影, 插画, 写作, 木工, 故事采集, 徒步, 生态观察, 溪谷探访, 村史讲述, 手工市集, 音乐夜, 艺术节） */
  activityType: string

  /*活动开始时间 */
  startTime: string

  /*活动结束时间 */
  endTime: string

  /*空间ID */
  spaceId: number

  /*空间名称 */
  spaceName: string

  /*活动详情 */
  detail: string

  /*审核状态（审核中、审核通过、审核未通过） */
  auditStatus: string

  /*创建时间 */
  createTime: string

  /*报名人数 */
  registeredCount: number

  /*活动状态（报名中、活动中、已结束） */
  activityStatus: string

  /*当前登录用户是否报名（未登录时为false） */
  isRegistered: boolean
  registeredUsers: RegistrationUser[]
  organizer: AppUserInfoRespVO
}

export interface RegistrationUser {
  userId: number
  wxName: string
  memberName: string
  logo: string
  introduction: string
  memberLevel: string //成员等级（字典键值：0=老村民，1=新村民，2=数字游民，3=游客）
  memberTags: string[] //成员标签（字典键值：0=空间主理人，1=活动发起人）
  follow: boolean // 是否关注
}

export interface Organizer extends RegistrationUser {
  follow: boolean
}
export interface FavoriteUser extends RegistrationUser { }

export interface Space {
  id: number
  name: string
  address: string
  mapImages: string[]
}

export interface ActivityDetail {
  id: number
  title: string
  logo: string
  startTime: string
  endTime: string
  organizer: Organizer
  space: Space
  fee: number
  isFree: boolean
  detail: string
  favoriteCount: number
  favoriteUsers: FavoriteUser[]
  /*当前用户是否收藏（未登录时为false） */
  isFavorited: boolean

  /*总报名人数（活动总共可以报名的人数） */
  maxParticipants: number

  /*已报名人数 */
  registeredCount: number

  /*是否限制人数（false=不限制，true=限制） */
  isLimitParticipants: boolean

  /*活动状态（报名中、活动中、已结束） */
  activityStatus: string

  activityType: string

  /*审核状态（审核中、审核通过、审核未通过） */
  auditStatus: string

  /*当前登录用户是否报名（未登录时为false） */
  isRegistered: boolean
}

export interface ActivityRegistration {
  count: number
  userList: RegistrationUser[]
}

export interface ActivityShareInfo {
  activityId: number
  title: string
  logo: string
  shareUrl: string
  shareTitle: string
  shareDesc: string
}
