import { AppUserInfoRespVO } from './user-follow'

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

  /*活动类型：0-摄影，1-徒步，2-绘画，3-木工，4-陶艺，5-生态观察，6-农耕体验，7-音乐，8-手工制作，9-瑜伽 */
  activityType: string

  /*活动开始时间 */
  startTime: string

  /*活动结束时间 */
  endTime: string

  // /*所属空间ID */
  // spaceId: number

  // /*所属空间名称 */
  // spaceName: string

  // /*所属空间地址 */
  // spaceAddress: string

  /**所属空间信息 */
  space?: Space

  /*活动详情 */
  detail: string

  /*审核状态:待审核 审核通过 审核不通过） */
  auditStatus: string

  /*活动状态（报名中， 活动中， 已结束） */
  activityStatus: string

  /*创建时间 */
  createTime: string

  /*报名人数 */
  registeredCount: number
  registeredUsers: RegistrationUser[]
  organizer: AppUserInfoRespVO
}


export interface RegistrationUser {
  userId: number
  wxName: string
  memberName: string
  logo: string
  tags: string
  spaceName?: string
  introduction: string
  memberLevel: string //成员等级（字典键值：0=老村民，1=新村民，2=数字游民，3=游客）
  memberTags: string[] //成员标签（字典键值：0=空间主理人，1=活动发起人）
}

export interface Organizer extends RegistrationUser {}

export interface Space {
  id: number
  name: string
  address: string
  mapImages: string[]
}

export interface FavoriteUser {
  userId: number
  avatar: string
  introduction: string | null
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
  isFavorited: boolean
  activityType?: ActivityType
  auditStatus?: string
  activityStatus?: string
  maxParticipants?: number
}

export interface RegistrationUser {
  userId: number
  wxName: string
  memberName: string
  logo: string
  registrationTime: string
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
