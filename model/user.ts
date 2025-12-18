import type { ID, ImageResource } from './common'

export interface UserProfile {
  id: ID
  nickname: string
  avatar?: ImageResource
  bio?: string
}

export interface CompanionInfo {
  id: ID
  avatar?: ImageResource
  nickname: string
}

export interface CompanionGroup {
  companions: CompanionInfo[]
  totalCount: number
}

export interface FollowInfo {
  isFollowed: boolean
  followersCount: number
  followingCount: number
}

