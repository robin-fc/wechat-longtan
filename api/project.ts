import { getData, postData } from '../utils/request'
import type { ProjectListItem, ProjectDetail } from '../model/project'
import type { PageResult } from '../model/common'

const baseUrl = '/app-api/daolongtan/project'

/**
 * 社区项目分页
 */
export function getProjectPage(params: {
  keyword?: string
  projectStatus: string
  pageNo: string
  pageSize: string
}): Promise<PageResult<ProjectListItem>> {
  return getData<PageResult<ProjectListItem>>(`${baseUrl}/page`, params)
}

/**
 * 社区项目详情
 */
export function getProjectDetail(id: number): Promise<ProjectDetail> {
  return getData<ProjectDetail>(`${baseUrl}/detail`, { id: String(id) })
}

/**
 * 看好该项目
 */
export function markInterest(projectId: number): Promise<boolean> {
  return postData<boolean>(`${baseUrl}/interest?projectId=${projectId}`, { projectId })
}

/**
 * 取消看好
 */
export function cancelInterest(projectId: number): Promise<boolean> {
  return postData<boolean>(`${baseUrl}/cancel-interest?projectId=${projectId}`, { projectId })
}

/**
 * 看好人数
 */
export function getInterestCount(projectId: number): Promise<number> {
  return getData<number>(`${baseUrl}/interest-count`, { projectId: String(projectId) })
}

const favoriteBaseUrl = '/app-api/daolongtan/favorite'

/**
 * 收藏项目
 */
export function favoriteProject(projectId: number): Promise<boolean> {
  return postData<boolean>(
    `${favoriteBaseUrl}/favorite?objectType=project&objectId=${projectId}`,
    { objectType: 'project', objectId: projectId }
  )
}

/**
 * 取消收藏项目
 */
export function unfavoriteProject(projectId: number): Promise<boolean> {
  return postData<boolean>(
    `${favoriteBaseUrl}/unfavorite?objectType=project&objectId=${projectId}`,
    { objectType: 'project', objectId: projectId }
  )
}

/**
 * 收藏人数
 */
export function getFavoriteCount(projectId: number): Promise<number> {
  return getData<number>(`${favoriteBaseUrl}/count`, {
    objectType: 'project',
    objectId: String(projectId),
  })
}
