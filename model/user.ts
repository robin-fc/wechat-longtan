export interface UserProfile {
  joinTime: string
  id: number
  wxName?: string
  logo?: string
  openId?: string
  memberName?: string
  memberPhone?: string
  memberNumber?: string
  memberLevel?: string
  memberTags?: string[]
  sex?: number
  desc?: string
  status?: number
}

export interface AppUserDetailRespVO {
  id: number
  wxName?: string
  logo?: string
  openId?: string
  memberName?: string
  memberPhone?: string
  memberNumber?: string
  memberLevel?: string
  memberTags?: string[]
  sex?: number
  desc?: string
  status?: number
  joinTime?: string
}

export interface FollowUserItem {
  userId: number
  avatar?: string
  introduction?: string
}

export interface AppUpdateWeixinUserInfoReqVO {
  wxName?: string
  logo?: string
  memberPhone?: string
  memberName?: string
  sex?: number
  desc?: string
}
