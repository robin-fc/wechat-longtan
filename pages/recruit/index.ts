/**
 * 找人页（按设计稿 08e5b857 重构）
 * API: /app-api/daolongtan/user/find
 */

import { getData } from '../../utils/request'
import type { PageResult } from '../../model/common'
import { smartNavigateTo } from '../../utils/navigation'

interface FindUserItem {
  user: {
    userId: number; logo?: string; wxName?: string; memberName?: string
    memberNumber?: string; introduction?: string; memberLevel?: string; memberTags?: string[]; followed?: boolean;
  }
  homestays: { id: number; name: string }[]
}

interface FindUserView {
  userId: number; logo: string; nickname: string
  memberNumber: string; gender: number
  levelLabel: string; levelClass: string
  tags: { label: string; className: string }[]
  introduction: string; homestays: { id: number; name: string }[]
}

interface RecruitState {
  list: FindUserView[]
  keyword: string
  level: string
  loading: boolean
  hasMore: boolean
  pageNo: number
}

const PAGE_SIZE = 10

function tagColorClass(_t: string, i: number): string { return ['tag-host','tag-role','tag-dev','tag-other'][i] || 'tag-other' }
function levelToClass(l: string): string {
  return ({ 老村民:'tag-normal',新村民:'tag-new',数字游民:'tag-nomad-green',游客:'tag-nomad-green' })[l] || 'tag-normal'
}

function mapItem(item: FindUserItem): FindUserView {
  const u = item.user; const lv = u.memberLevel || ''
  return {
    userId: u.userId, logo: u.logo || '/assets/images/default-avatar.png',
    nickname: u.memberName || u.wxName || '用户', gender: 0,
    memberNumber: u.memberNumber || '', levelLabel: lv, levelClass: levelToClass(lv),
    tags: (u.memberTags || []).map((t, i) => ({ label: t, className: tagColorClass(t, i) })),
    introduction: u.introduction || '', homestays: item.homestays || [],
  }
}

Page<RecruitState, WechatMiniprogram.IAnyObject>({
  data: { list: [], keyword: '', level: '2', loading: false, hasMore: true, pageNo: 1 },

  onLoad() { this.fetchList(true) },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) this.fetchList(false)
  },

  async fetchList(reset: boolean) {
    const pageNo = reset ? 1 : this.data.pageNo
    this.setData({ loading: true })

    try {
      const res = await getData<PageResult<FindUserItem>>('/app-api/daolongtan/user/find', {
        pageNo: String(pageNo), pageSize: String(PAGE_SIZE),
        memberLevel: this.data.level,
        nickname: this.data.keyword || undefined,
      })
      const views = (res?.list || []).map(mapItem)
      this.setData({
        list: reset ? views : [...this.data.list, ...views],
        hasMore: views.length === PAGE_SIZE,
        pageNo: pageNo + 1,
        loading: false,
      })
    } catch (e) { this.setData({ loading: false }) }
  },

  onSearchInput(e: WechatMiniprogram.Input) { this.setData({ keyword: e.detail.value }) },
  onSearchConfirm() { this.fetchList(true) },

  onLevelChange(e: WechatMiniprogram.BaseEvent) {
    this.setData({ level: e.currentTarget.dataset.level as string })
    this.fetchList(true)
  },

  onUserTap(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id
    if (id) smartNavigateTo(`/pages/user/other-profile/index?userId=${id}`)
  },

  onHomestayTap(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id
    if (id) smartNavigateTo(`/pages/homestay/detail?id=${id}`)
  },

  onShareAppMessage() {
    return { title: 'DAO龙潭 - 找人', path: '/pages/recruit/index' }
  },
})