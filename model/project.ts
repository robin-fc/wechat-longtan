import { PageResult } from './common'

/**
 * 项目发起人信息（与 AppUserInfoRespVO 对齐）
 */
export interface ProjectInitiator {
  userId: number
  logo: string
  wxName: string
  memberName?: string
  introduction?: string
  memberLevel?: string
  memberTags?: string[]
}

export interface ProjectInterestUser {
  id?: number
  logo: string
}

/**
 * 项目列表项（对应 AppProjectListRespVO）
 */
export interface ProjectListItem {
  /** 项目ID */
  id: number
  /** 项目名称 */
  title: string
  /** 项目背景图URL */
  image: string
  /** 项目进度（1=进行中 2=已完结） */
  projectStatus?: number
  /** 项目进度标签（进行中/已完结） */
  projectStatusLabel: string
  /** 发起人信息 */
  initiator: ProjectInitiator
  /** 最大报名人数 */
  maxEnrollment: number
  /** 已报名人数 */
  enrolledCount: number
  /** 截止时间（年月日） */
  deadline: string
  /** 看好人数 */
  interestCount?: number
  /** 看好用户头像列表 */
  interestUsers?: ProjectInterestUser[]
  /** 当前用户是否已看好 */
  interested: boolean
}

/**
 * 项目详情（对应 AppProjectRespVO）
 */
export interface ProjectDetail {
  /** 项目ID */
  id: number
  /** 项目名称 */
  title: string
  /** 项目背景图URL */
  image: string
  /** 项目进度（1=进行中 2=已完结） */
  projectStatus: number
  /** 项目进度标签 */
  projectStatusLabel: string
  /** 发起人信息 */
  initiator: ProjectInitiator
  /** 项目标签 */
  tags?: string[]
  /** 截止时间 */
  deadline?: string
  /** 项目简介 */
  introduction: string
  /** 所需支持 */
  supportNeeded: string
  /** 发起人联系方式 */
  contactInfo: string
  /** 项目总结 */
  summary: string
  /** 项目群图片（JSON 数组 URL 或单个 URL 字符串） */
  groupImages: string
  /** 是否限制报名人数 */
  limitEnrollment: boolean
  /** 最大报名人数 / 看好目标人数 */
  maxEnrollment: number
  /** 已报名人数 */
  enrolledCount: number
  /** 看好人数 */
  interestCount: number
  /** 看好用户头像列表 */
  interestUsers?: ProjectInterestUser[]
  /** 当前用户是否已看好 */
  interested: boolean
  /** 当前用户是否已收藏 */
  favorited: boolean
}


