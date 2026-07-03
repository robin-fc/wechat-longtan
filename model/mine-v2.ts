/**
 * 个人页 v2 — 类型定义
 *
 * 对应接口：
 *   GET /app-api/daolongtan/user/profile/v2/header
 *   GET /app-api/daolongtan/user/profile/v2/dashboard-summary
 *   GET /app-api/daolongtan/user/profile/v2/project/page
 */

// ====== Header（头区） ======

/** 负责的民宿/基地简要信息 */
export interface AppUserHomestayBriefRespVO {
  id: number
  /** 民宿名称 */
  name: string
}

/** 个人页 v2 - 头区 Response VO */
export interface AppUserProfileHeaderRespVO {
  /** 用户编号 */
  id: number
  /** 微信昵称 */
  wxName?: string
  /** 微信头像 */
  logo?: string
  /** 微信 openid */
  openId?: string
  /** 成员名称 */
  memberName?: string
  /** 成员手机号 */
  memberPhone?: string
  /** 成员编号（格式：DLT+6位数字，如 DLT000001） */
  memberNumber?: string
  /** 成员等级（老村民 / 新村民 / 数字游民 / 游客） */
  memberLevel?: string
  /** 成员标签（空间主理人 / 活动发起人 等） */
  memberTags?: string[]
  /** 性别（0=未知, 1=男, 2=女） */
  sex?: number
  /** 简介/描述 */
  desc?: string
  /** 用户状态（0=正常, 1=停用） */
  status?: number
  /** 加入时间（ISO 8601） */
  joinTime?: string
  /** 数字游民认证状态（仅 memberLevel=3 时返回） */
  nomadApplyStatus?: string
  /** 当前登录用户是否关注了该用户 */
  followed?: boolean
  /** 负责的民宿/基地列表 */
  homestays?: AppUserHomestayBriefRespVO[]
  /** 头图背景 URL（预留） */
  backgroundUrl?: string
  /** 当前登录用户是否可编辑该页 */
  editable?: boolean
  /** 当前登录用户是否可关注该用户 */
  followable?: boolean
}

// ====== Dashboard Summary（仪表盘统计） ======

export interface AppUserProfileCommunityLifeSummaryVO {
  /** 文章数 */
  articleCount: number
  /** 视频数 */
  videoCount: number
}

export interface AppUserProfileProjectSummaryVO {
  /** 我参与的项目数 */
  participatedCount: number
  /** 我发布的项目数 */
  publishedCount: number
}

export interface AppUserProfileActivitySummaryVO {
  /** 我参与的活动数 */
  participatedCount: number
  /** 我发布的活动数 */
  publishedCount: number
  /** 我收藏的活动数（仅本人可见） */
  collectedCount: number
  /** 待评价的活动数（仅本人可见） */
  pendingReviewCount: number
  /** 已评价的活动数（仅本人可见） */
  reviewedCount: number
  /** 活动收益，单位：元（仅本人可见） */
  earnings: number
}

export interface AppUserProfileStaySummaryVO {
  /** 待付款的住宿订单数 */
  pendingPaymentCount: number
  /** 待审核的住宿订单数 */
  pendingAuditCount: number
  /** 待入住的住宿订单数 */
  pendingCheckInCount: number
}

/** 兴趣用户分组 */
export interface AppUserProfileFriendGroupVO {
  /** 人数 */
  count: number
  /** 用户列表 */
  users: AppUserInfoRespVO[]
}

/** 个人页 - 好友/兴趣数据 */
export interface AppUserProfileFriendsSummaryVO {
  /** 我感兴趣的 */
  interested: AppUserProfileFriendGroupVO
  /** 对我感兴趣的 */
  interestedInMe: AppUserProfileFriendGroupVO
}

/** 个人页 v2 - 仪表盘统计 Response VO */
export interface AppUserProfileDashboardSummaryRespVO {
  /** 视角：SELF=本人，OTHER=他人 */
  viewType: string
  /** 目标用户编号 */
  targetUserId: number
  /** 社区生活统计 */
  communityLife: AppUserProfileCommunityLifeSummaryVO
  /** 项目统计 */
  project: AppUserProfileProjectSummaryVO
  /** 活动统计 */
  activity: AppUserProfileActivitySummaryVO
  /** 入住统计 */
  stay: AppUserProfileStaySummaryVO
  /** 好友/兴趣数据 */
  friends?: AppUserProfileFriendsSummaryVO
}

// ====== Project Page（项目分页） ======

/** 用户 APP - 用户信息 Response VO */
export interface AppUserInfoRespVO {
  /** 用户编号 */
  userId: number
  /** 用户头像 */
  logo?: string
  /** 用户微信名 */
  wxName?: string
  /** 成员名称 */
  memberName?: string
  /** 用户简介 */
  introduction?: string
  /** 成员等级 */
  memberLevel?: string
  /** 组织者标签 */
  memberTags?: string[]
  /** 当前登录用户是否关注了该用户 */
  followed?: boolean
}

/** 用户 APP - 社区项目列表项 */
export interface AppProjectListRespVO {
  /** 项目ID */
  id: number
  /** 项目名称 */
  title?: string
  /** 项目背景图URL */
  image?: string
  /** 项目进度标签（进行中/已完结） */
  projectStatusLabel?: string
  /** 发起人 */
  initiator?: AppUserInfoRespVO
  /** 最大报名人数 */
  maxEnrollment?: number
  /** 已报名人数 */
  enrolledCount?: number
  /** 截止时间（年月日） */
  deadline?: string
  /** 当前用户是否已看好 */
  interested?: boolean
  /** 看好该项目的用户列表 */
  interestedUsers?: AppUserInfoRespVO[]
}

/** 分页结果 */
export interface PageResultAppProjectListRespVO {
  /** 总量 */
  total: number
  /** 数据 */
  list: AppProjectListRespVO[]
}

// ====== API 响应包装 ======

/** 统一 API 响应格式 */
export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}
