import type { ImageResource, Price, TimeRange } from './common'

export enum ActivityType {
  Photography = 0,
  Hike = 1,
  Painting = 2,
  Woodwork = 3,
  Pottery = 4,
  EcologyObservation = 5,
  FarmingExperience = 6,
  Music = 7,
  Handcraft = 8,
  Yoga = 9,
}

export const ActivityTypeLabel: Record<ActivityType, string> = {
  [ActivityType.Photography]: '摄影',
  [ActivityType.Hike]: '徒步',
  [ActivityType.Painting]: '绘画',
  [ActivityType.Woodwork]: '木工',
  [ActivityType.Pottery]: '陶艺',
  [ActivityType.EcologyObservation]: '生态观察',
  [ActivityType.FarmingExperience]: '农耕体验',
  [ActivityType.Music]: '音乐',
  [ActivityType.Handcraft]: '手工制作',
  [ActivityType.Yoga]: '瑜伽',
}

export interface Activity {
  id: number
  title: string
  logo?: string
  collectionId?: number
  collectionName?: string
  fee?: number
  isFree: boolean
  activityType?: string
  startTime: string
  endTime: string
  spaceId: number
  spaceName: string
  detail?: string
  createTime?: string
  poster?: ImageResource
  secondaryTag?: { id?: string; name: string }
  timeRange?: TimeRange
  price?: Price
  status?: string
  space?: Space
  organizer?: Organizer
  companions?: {
    companions: Array<{ id?: string; avatar: ImageResource; nickname?: string }>
    totalCount?: number
  }
  auditStatus?: number // 0: 待审核, 1: 审核通过, 2: 审核不通过
}

export interface ActivityCollection {
  id: number
  name: string
  logo?: string
  coverUrl?: string
  listUrl?: string
  creatorId: number
  creatorName?: string
  creatorAvatar?: string
  description?: string
  createTime?: string
}

export interface Organizer {
  userId: number
  wxName: string
  memberName: string
  logo: string
  tags: string
  spaceName?: string
}

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
  auditStatus?: number
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
