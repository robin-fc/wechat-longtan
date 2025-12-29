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
}

export interface ActivityCollection {
  id: number
  name: string
  logo?: string
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
}

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
