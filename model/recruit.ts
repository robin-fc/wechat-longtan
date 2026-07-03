/**
 * 招人职位列表项
 */
export interface RecruitListItem {
  id: number
  title: string
  position: string
  description: string
  contactInfo?: string
  createTime: string
}

/**
 * 招人职位详情
 */
export interface RecruitDetail {
  id: number
  title: string
  position: string
  description: string
  requirements: string
  contactInfo: string
  createTime: string
}
