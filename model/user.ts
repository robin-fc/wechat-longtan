export interface UserProfile {
  nomadApplyStatus: string
  joinTime: string
  id: number
  wxName?: string
  logo?: string
  openId?: string
  memberName?: string
  memberPhone?: string
  memberNumber: string
  memberLevel: string
  memberTags: string[]
  sex?: number
  desc?: string
  status?: number
}

export interface AppUserDetailRespVO {
  followed: boolean;
  id: number
  wxName?: string
  logo?: string
  openId?: string
  memberName?: string
  memberPhone?: string
  memberNumber?: string
  memberLevel?: string
  memberTags?: string[]
  nomadApplyStatus?: string
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
