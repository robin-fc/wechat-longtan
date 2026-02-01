import { request, getData } from '../utils/request'
import type { AppUpdateWeixinUserInfoReqVO, AppUserDetailRespVO } from '../model/user'
import type { AppUserInfoRespVO } from '../model/user-follow'
import type { CommonResult, PageResult } from '../model/common'

const baseUrl = '/app-api/daolongtan/user'


export interface AppUserPageReqVO {
  type: string
  bizId?: string | number
  pageNo?: number
  pageSize?: number
  userId?: string | number
  activityId?: string | number
  homeStayId?: string | number
}

export function AppUser_getUserList(data: AppUserPageReqVO) {
  return request<{ pageResult: PageResult<AppUserInfoRespVO> }>({
    url: `${baseUrl}/list`,
    method: 'GET',
    data,
  })
}

export function updateUserInfo(data: AppUpdateWeixinUserInfoReqVO): Promise<CommonResult<boolean>> {
  return request<boolean>({
    url: `${baseUrl}/update-info`,
    method: 'PUT',
    data,
  })
}

export function getUserDetail(userId: string | number): Promise<AppUserDetailRespVO> {
  return getData<AppUserDetailRespVO>(`${baseUrl}/detail`, { userId })
}

export interface MockUserItem {
  userId: string
  nickname: string
  avatar: string
  tags: string[]
  bio: string
  isFollowed: boolean
}

export function mapMemberLevelLabel(level: unknown): string {
  const v = level === undefined || level === null ? '' : String(level)
  if (v === '0') return '老村民'
  if (v === '1') return '新村民'
  if (v === '2') return '数字游民'
  if (v === '3') return '游客'
  return '游客'
}

export function mapMemberTags(v: unknown): string[] {
  const MemberTagMap: Record<string, string> = {
    '0': '空间主理人',
    '1': '活动发起人',
  }
  const codes = (() => {
    if (v === undefined || v === null) return []
    if (Array.isArray(v)) return v.map((it) => String(it))
    const s = String(v).trim()
    if (!s) return []
    if (s.startsWith('[') && s.endsWith(']')) {
      try {
        const arr = JSON.parse(s)
        if (Array.isArray(arr)) return arr.map((it) => String(it))
      } catch { }
    }
    return s.split(',')
  })()
    .map((it) => String(it).trim().replace(/^"+|"+$/g, ''))
    .filter(Boolean)

  return codes.map((code) => MemberTagMap[code]).filter(Boolean)
}

export function fetchMockUserList(type: string, id?: string): Promise<MockUserItem[]> {
  if (type === 'following') {
    return getData<AppUserInfoRespVO[]>(
      `${baseUrl}-follow/followings`
    ).then((list) =>
      (list || []).map((u) => {
        const nickname = ((u.memberName || u.wxName) || '').trim()
        const avatar = (u.logo || '').trim() || '/assets/images/default-avatar.png'
        const tags = [
          mapMemberLevelLabel(u.memberLevel),
          ...mapMemberTags(u.memberTags),
        ].filter(Boolean)
        return {
          userId: String(u.userId),
          nickname: nickname || `User ${u.userId}`,
          avatar,
          tags,
          bio: u.introduction ? String(u.introduction) : '',
          isFollowed: true,
        }
      })
    )
  }

  if (type === 'followers') {
    return getData<AppUserInfoRespVO[]>(
      `${baseUrl}/followers`
    ).then((list) =>
      (list || []).map((u) => {
        const nickname = ((u.memberName || u.wxName) || '').trim()
        const avatar = (u.logo || '').trim() || '/assets/images/default-avatar.png'
        const tags = [
          mapMemberLevelLabel(u.memberLevel),
          ...mapMemberTags(u.memberTags),
        ].filter(Boolean)
        return {
          userId: String(u.userId),
          nickname: nickname || `User ${u.userId}`,
          avatar,
          tags,
          bio: u.introduction ? String(u.introduction) : '',
          isFollowed: false,
        }
      })
    )
  }

  // 其他列表类型暂沿用 mock
  return Promise.resolve([])
}

export interface AppUserSummaryByUserRespVO {
  followerCount: number
  followingCount: number
}

export function getUserSummaryByUser(userId: string | number): Promise<AppUserSummaryByUserRespVO> {
  return getData<AppUserSummaryByUserRespVO>(`${baseUrl}/summary-by-user`, { userId })
}
