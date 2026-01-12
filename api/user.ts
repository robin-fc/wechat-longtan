import { request, getData } from '../utils/request'
import type { AppUpdateWeixinUserInfoReqVO } from '../model/user'
import type { CommonResult } from '../model/common'

export function updateUserInfo(data: AppUpdateWeixinUserInfoReqVO): Promise<CommonResult<boolean>> {
  return request<boolean>({
    url: '/app-api/daolongtan/user/update-info',
    method: 'PUT',
    data,
  })
}

export interface MockUserItem {
  userId: string
  nickname: string
  avatar: string
  tags: string[]
  bio: string
  isFollowed: boolean
}

interface FollowingsUserItem {
  userId: number
  logo: string
  wxName: string
  memberName: string
  introduction: string | null
  memberLevel: string
  tags: unknown
}

function mapMemberLevelLabel(level: unknown): string {
  const v = level === undefined || level === null ? '' : String(level)
  if (v === '0') return '老村民'
  if (v === '1') return '新村民'
  if (v === '2') return '数字游民'
  if (v === '3') return '游客'
  return '游客'
}

function mapMemberTags(v: unknown): string[] {
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
      } catch {}
    }
    return s.split(',')
  })()
    .map((it) => String(it).trim().replace(/^"+|"+$/g, ''))
    .filter(Boolean)

  return codes.map((code) => MemberTagMap[code]).filter(Boolean)
}

export function fetchMockUserList(type: string, id?: string): Promise<MockUserItem[]> {
  if (type === 'following') {
    return getData<FollowingsUserItem[]>(
      '/app-api/daolongtan/user-follow/followings'
    ).then((list) =>
      (list || []).map((u) => {
        const nickname = (u.memberName || u.wxName || '').trim()
        const avatar = (u.logo || '').trim() || '/assets/images/default-avatar.png'
        const tags = [
          mapMemberLevelLabel(u.memberLevel),
          ...mapMemberTags(u.tags),
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
    return getData<FollowingsUserItem[]>(
      '/app-api/daolongtan/user-follow/followers'
    ).then((list) =>
      (list || []).map((u) => {
        const nickname = (u.memberName || u.wxName || '').trim()
        const avatar = (u.logo || '').trim() || '/assets/images/default-avatar.png'
        const tags = [
          mapMemberLevelLabel(u.memberLevel),
          ...mapMemberTags(u.tags),
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
