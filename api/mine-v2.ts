/**
 * 个人页 v2 — API 封装
 *
 * 对应接口：
 *   GET /app-api/daolongtan/user/profile/v2/header
 *   GET /app-api/daolongtan/user/profile/v2/dashboard-summary
 *   GET /app-api/daolongtan/user/profile/v2/community-life/page   【type: 1=文章, 2=视频】
 *   GET /app-api/daolongtan/user/profile/v2/project/page          【type: 1=参与, 2=发布】
 */

import { getData } from '../utils/request'
import type {
  AppUserProfileHeaderRespVO,
  AppUserProfileDashboardSummaryRespVO,
  PageResultAppProjectListRespVO,
} from '../model/mine-v2'

const BASE = '/app-api/daolongtan/user/profile/v2'

/**
 * 个人页头区（本人/他人共用）
 * @param userId - 目标用户编号，不传则查本人（需登录）
 */
export function fetchProfileHeader(
  userId?: number
): Promise<AppUserProfileHeaderRespVO> {
  return getData<AppUserProfileHeaderRespVO>(
    `${BASE}/header`,
    userId ? { userId } : undefined
  )
}

/**
 * 个人页仪表盘统计
 * @param userId - 目标用户编号，不传则查本人（需登录）
 */
export function fetchDashboardSummary(
  userId?: number
): Promise<AppUserProfileDashboardSummaryRespVO> {
  return getData<AppUserProfileDashboardSummaryRespVO>(
    `${BASE}/dashboard-summary`,
    userId ? { userId } : undefined
  )
}

/**
 * 社区生活列表（文章/视频）
 * @param type   - 1=文章, 2=视频
 * @param pageNo / pageSize
 * @param userId - 目标用户编号
 */
export function fetchCommunityLifePage(
  type: number,
  pageNo: number,
  pageSize: number,
  userId?: number
): Promise<PageResultAppProjectListRespVO> {
  const params: Record<string, any> = {
    type: String(type),
    pageNo: String(pageNo),
    pageSize: String(pageSize),
  }
  if (userId) params.userId = String(userId)
  return getData<PageResultAppProjectListRespVO>(`${BASE}/community-life/page`, params)
}

/**
 * 项目列表（参与/发布）
 * @param type     - 1=参与, 2=发布
 * @param pageNo / pageSize
 * @param userId   - 目标用户编号
 */
export function fetchProjectPage(
  type: number,
  pageNo: number,
  pageSize: number,
  userId?: number
): Promise<PageResultAppProjectListRespVO> {
  const params: Record<string, any> = {
    type: String(type),
    pageNo: String(pageNo),
    pageSize: String(pageSize),
  }
  if (userId) params.userId = String(userId)
  return getData<PageResultAppProjectListRespVO>(`${BASE}/project/page`, params)
}
