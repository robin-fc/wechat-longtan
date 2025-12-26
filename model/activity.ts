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
