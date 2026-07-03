import { getData } from '../utils/request'
import type { PageResult } from '../model/common'
import type { RecruitListItem } from '../model/recruit'

const baseUrl = '/app-api/daolongtan/recruit'

/**
 * 招人列表分页（占位，后端待实现）
 */
export function getRecruitPage(params: {
  pageNo: string
  pageSize: string
  keyword?: string
}): Promise<PageResult<RecruitListItem>> {
  return getData<PageResult<RecruitListItem>>(`${baseUrl}/page`, params)
}
