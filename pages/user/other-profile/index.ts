/**
 * 他人主页 — 4 Tab 各自独立数据源
 *
 * 社区生活 → fetchCommunityLifePage（1=文章, 2=视频）
 * 项目     → fetchProjectPage（1=参与, 2=发布）
 * 活动     → getUserActivityList（userId + type: 1=参与, 2=发布, 3=收藏）
 * 朋友     → AppUser_getUserList（4=他人关注, 5=他人粉丝）
 */

import { fetchProfileHeader, fetchCommunityLifePage, fetchProjectPage } from '../../../api/mine-v2'
import { getUserActivityList } from '../../../api/activity'
import { AppUser_getUserList } from '../../../api/user'
import { smartNavigateTo } from '../../../utils/navigation'
import { formatYMD } from '../../../utils/date'
import type {
  AppUserProfileHeaderRespVO,
  AppProjectListRespVO,
} from '../../../model/mine-v2'

interface OtherProfileState {
  profile: ProfileView | null
  currentTab: number
  communitySubTab: number
  projectSubTab: number
  activitySubTab: number
  friendSubTab: number
  /** 社区生活 */
  communityItems: AppProjectListRespVO[]
  /** 项目 */
  projectItems: AppProjectListRespVO[]
  /** 活动 */
  activityItems: any[]
  /** 朋友 */
  friendItems: any[]
  userId: string
  loading: boolean
  showHomeButton: boolean
  menuTop: number
  menuHeight: number
}

interface ProfileView {
  id: number; memberName: string; wxName: string; logo: string
  memberNumber: string; joinTimeText: string; gender: number; desc: string
  levelTags: { label: string; className: string }[]
  roleTags: { label: string; className: string }[]
  homestayId: number; homestayName: string; isFollowed: boolean
}

function levelToClass(l: string): string {
  return ({ 老村民:'tag-normal',新村民:'tag-new',数字游民:'tag-nomad-green',游客:'tag-nomad-green' })[l] || 'tag-normal'
}
function tagColorClass(_t: string, i: number): string { return ['tag-host','tag-role','tag-dev','tag-other'][i] || 'tag-other' }

function buildProfileView(h: AppUserProfileHeaderRespVO): ProfileView {
  const lv = h.memberLevel || ''; const tags = h.memberTags || []
  return {
    id: h.id, memberName: h.memberName || '', wxName: h.wxName || '',
    logo: h.logo || '/assets/images/default-avatar.png',
    memberNumber: h.memberNumber || '000000', joinTimeText: formatYMD(h.joinTime) || '',
    gender: h.sex || 2, desc: h.desc || '这个人很懒，什么都没写~',
    levelTags: lv ? [{ label: lv, className: levelToClass(lv) }] : [],
    roleTags: tags.map((t,i) => ({ label: t, className: tagColorClass(t,i) })),
    homestayId: h.homestays?.[0]?.id || 0,
    homestayName: h.homestays?.[0]?.name || '', isFollowed: h.followed || false,
  }
}

/** 活动 subTab → type */
const ACTIVITY_TYPE_MAP: Record<number, string> = { 0: '2', 1: '1', 2: '3' }
/** 朋友 subTab → type（0=对他感兴趣的→粉丝=5, 1=他感兴趣的→关注=4） */
const FRIEND_TYPE_MAP: Record<number, string> = { 0: '5', 1: '4' }

Page<OtherProfileState, WechatMiniprogram.IAnyObject>({
  data: {
    profile: null,
    currentTab: 0, communitySubTab: 0, projectSubTab: 0, activitySubTab: 0, friendSubTab: 0,
    communityItems: [], projectItems: [], activityItems: [], friendItems: [],
    userId: '',
    loading: false, showHomeButton: false, menuTop: 0, menuHeight: 0,
  },

  async onLoad(options: Record<string, string | undefined>) {
    const userId = options.userId || ''
    const mi = wx.getMenuButtonBoundingClientRect()
    const pages = getCurrentPages()
    this.setData({ showHomeButton: pages.length === 1, menuTop: mi.top, menuHeight: mi.height, userId })
    if (!userId) { wx.showToast({ title: '用户不存在', icon: 'none' }); return }

    await Promise.all([this.loadProfile(userId)])
    this.loadCommunityItems()
  },

  async loadProfile(userId: string) {
    try { this.setData({ profile: buildProfileView(await fetchProfileHeader(Number(userId))) }) } catch (e) {}
  },

  // ====== 社区生活（文章 / 视频） ======
  async loadCommunityItems() {
    const type = this.data.communitySubTab === 0 ? 1 : 2
    try {
      const result = await fetchCommunityLifePage(type, 1, 20, Number(this.data.userId))
      this.setData({ communityItems: result?.list || [] })
    } catch (e) { this.setData({ communityItems: [] }) }
  },

  // ====== 项目（参与 / 发布） ======
  async loadProjectItems() {
    const type = this.data.projectSubTab === 0 ? 1 : 2
    try {
      const result = await fetchProjectPage(type, 1, 20, Number(this.data.userId))
      this.setData({ projectItems: result?.list || [] })
    } catch (e) { this.setData({ projectItems: [] }) }
  },

  // ====== 活动（发布 / 参与 / 收藏） ======
  async loadActivityItems() {
    const type = ACTIVITY_TYPE_MAP[this.data.activitySubTab] || '2'
    try {
      const result = await getUserActivityList({
        userId: this.data.userId,
        type,
        pageNo: '1',
        pageSize: '20',
      })
      const list = result?.pageResult?.list || result?.list || []
      this.setData({ activityItems: list })
    } catch (e) { this.setData({ activityItems: [] }) }
  },

  // ====== 朋友（对他感兴趣的 / 他感兴趣的） ======
  async loadFriendItems() {
    const type = FRIEND_TYPE_MAP[this.data.friendSubTab] || '5'
    try {
      const result = await AppUser_getUserList({
        type,
        userId: this.data.userId,
        pageNo: 1,
        pageSize: 20,
      })
      const list = result?.data?.pageResult?.list || []
      this.setData({ friendItems: list })
    } catch (e) { this.setData({ friendItems: [] }) }
  },

  // ====== Tab 切换 ======
  onTabChange(e: WechatMiniprogram.BaseEvent) {
    const idx = Number(e.currentTarget.dataset.index)
    this.setData({ currentTab: idx })
    if (idx === 0) this.loadCommunityItems()
    else if (idx === 1) this.loadProjectItems()
    else if (idx === 2) this.loadActivityItems()
    else if (idx === 3) this.loadFriendItems()
  },

  onCommunitySubTab(e: WechatMiniprogram.BaseEvent) {
    this.setData({ communitySubTab: Number(e.currentTarget.dataset.index), communityItems: [] })
    this.loadCommunityItems()
  },
  onProjectSubTab(e: WechatMiniprogram.BaseEvent) {
    this.setData({ projectSubTab: Number(e.currentTarget.dataset.index), projectItems: [] })
    this.loadProjectItems()
  },
  onActivitySubTab(e: WechatMiniprogram.BaseEvent) {
    const idx = Number(e.currentTarget.dataset.index)
    this.setData({ activitySubTab: idx, activityItems: [] })
    this.loadActivityItems()
  },
  onFriendSubTab(e: WechatMiniprogram.BaseEvent) {
    this.setData({ friendSubTab: Number(e.currentTarget.dataset.index), friendItems: [] })
    this.loadFriendItems()
  },

  // ====== 卡片点击 ======
  onArticleTap(e: WechatMiniprogram.BaseEvent) {
    const url = e.currentTarget.dataset.url as string | undefined
    if (url) {
      wx.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(url)}` })
      return
    }
    const id = e.currentTarget.dataset.id
    if (id) smartNavigateTo(`/pages/project/detail?id=${id}`)
  },
  onProjectTap(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id; if (id) smartNavigateTo(`/pages/project/detail?id=${id}`)
  },
  onCardTap(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id; if (id) smartNavigateTo(`/pages/activity/detail?id=${id}`)
  },
  onUserTap(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id; if (id) smartNavigateTo(`/pages/user/other-profile/index?userId=${id}`)
  },
  onBackTap() { this.data.showHomeButton ? wx.switchTab({ url: '/pages/home/index' }) : wx.navigateBack() },

  onHomestayTap() {
    const id = this.data.profile?.homestayId
    if (id) smartNavigateTo(`/pages/homestay/detail?id=${id}`)
  },

  onFollowToggle() {
    const p = this.data.profile; if (!p) return
    const { AppUserFollow, AppUserUnfollow } = require('../../../api/user-follow')
    ;(p.isFollowed ? AppUserUnfollow : AppUserFollow)({ followeeId: p.id }).then(() => {
      this.setData({ 'profile.isFollowed': !p.isFollowed })
    }).catch(() => {})
  },

  onShareAppMessage() {
    const p = this.data.profile
    if (!p) return { title: 'DAO龙潭 - 用户主页', path: '/pages/home/index' }
    return { title: `${p.memberName || p.wxName || '用户'}的主页`, path: `/pages/user/other-profile/index?userId=${p.id}` }
  },
})
