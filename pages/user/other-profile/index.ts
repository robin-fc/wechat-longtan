import { getUserDetail, getUserSummaryByUser } from '../../../api/user'
import { ensureActivityTypeDict, getUserActivityList } from '../../../api/activity'
import { formatYMDHM } from '../../../utils/date'

interface UserInfoView {
  userId: string
  avatar: string
  bgImage: string
  nickname: string
  gender: number
  tags: string[]
  joinTime: string
  bio: string
  followingCount: number
  followerCount: number
  isFollowed: boolean
}

interface ActivityCardItem {
  id: string
  title: string
  logo: string
  activityType: string
  organizer: {
    name?: string
    memberName?: string
    wxName?: string
    avatar?: string
    logo?: string
    memberLevel?: string
    tag?: string
  }
  startTime: string
  endTime: string
  spaceName: string
  fee: string | number
  registeredUsers: any[]
  registeredCount: number
  maxParticipants: number
  isLimitParticipants: boolean
}

interface OtherProfileState {
  menuTop: number
  menuHeight: number
  userInfo: UserInfoView | null
  currentTab: number
  currentList: ActivityCardItem[]
  userId?: string
  pageNo?: number
  pageSize?: number
  typeDict?: Record<string, string>
}

Page<OtherProfileState, WechatMiniprogram.IAnyObject>({
  data: {
    menuTop: 0,
    menuHeight: 0,
    userInfo: null,
    currentTab: 0,
    currentList: [],
    userId: '',
    pageNo: 1,
    pageSize: 20,
  },

  async onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const { userId, isFollowed } = options as any
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    this.setData({
      menuTop: menuButtonInfo.top,
      menuHeight: menuButtonInfo.height,
      userId: String(userId || ''),
    })
    try {
      const dict = await ensureActivityTypeDict()
      this.setData({ typeDict: dict })
    } catch (e) { }
    this.loadUserInfo(String(userId || ''), isFollowed)
    this.loadActivities(0)
  },

  async loadUserInfo(
    this: WechatMiniprogram.Page.TrivialInstance,
    userId: string,
    isFollowedOpt?: string
  ) {
    if (!userId) return
    try {
      const [raw, summary] = await Promise.all([
        getUserDetail(userId),
        getUserSummaryByUser(userId).catch(() => ({ followerCount: 0, followingCount: 0 }))
      ])

      const levelMap: Record<string, string> = {
        '0': '老村民',
        '1': '新村民',
        '2': '数字游民',
        '3': '游客',
      }
      const orgTagMap: Record<string, string> = {
        '0': '空间主理人',
        '1': '活动发起人',
      }
      const memberLevelText = String((raw?.memberLevel) ?? '')
      const levelLabel = levelMap[memberLevelText] || (memberLevelText || '')
      const rawTags = raw?.memberTags || []
      const tags = Array.isArray(rawTags) ? rawTags.map((v) => String(v)) : []
      const mappedOrgTags = tags.map((t) => orgTagMap[t] || t)
      const allTags = [levelLabel, ...mappedOrgTags].filter(Boolean)
      const userInfo: UserInfoView = {
        userId: String((raw?.id) ?? userId),
        avatar: raw?.logo || '',
        bgImage: '',
        nickname: (raw?.memberName || raw?.wxName) || '',
        gender: (raw?.sex !== undefined ? raw.sex : 1) || 1,
        tags: Array.from(new Set(allTags)),
        joinTime: formatYMDHM(raw?.joinTime || ''),
        bio: (raw?.desc || '') || '',
        followingCount: summary.followingCount || 0,
        followerCount: summary.followerCount || 0,
        isFollowed:
          isFollowedOpt !== undefined &&
            isFollowedOpt !== 'undefined' &&
            isFollowedOpt !== ''
            ? isFollowedOpt === 'true'
            : false, //todo
      }
      this.setData({ userInfo })
    } catch {
      wx.showToast({ title: '加载用户信息失败', icon: 'none' })
    }
  },

  onTabChange(this: WechatMiniprogram.Page.TrivialInstance, e: WechatMiniprogram.BaseEvent) {
    const index = e.currentTarget.dataset.index as number
    this.setData({
      currentTab: index,
      pageNo: 1,
    })
    this.loadActivities(index)
  },

  async loadActivities(this: WechatMiniprogram.Page.TrivialInstance, type: number) {
    const data = this.data as OtherProfileState
    const userId = data.userId || (data.userInfo && data.userInfo.userId) || ''
    if (!userId) {
      this.setData({ currentList: [] })
      return
    }
    const typeParam = type === 0 ? 1 : type === 1 ? 2 : 3
    const pageNo = data.pageNo || 1
    const pageSize = data.pageSize || 20
    try {
      const res: any = await getUserActivityList({
        userId,
        type: typeParam,
        pageNo,
        pageSize,
      })
      const list = (res && (res.list || res.items || res.data || [])) as any[]
      const mapped: ActivityCardItem[] = (list || []).map((it: any) => {
        const title = it.title || ''
        const poster =
          (it.poster && it.poster.url) || it.logo || it.coverUrl || ''
        const typeText = (() => {
          const sec = it.secondaryTag?.name
          if (sec) return sec
          const dict = (this.data as OtherProfileState).typeDict || {}
          const v = it.activityType
          const s = String(v ?? '').trim()
          if (s) {
            return dict[s] || s
          }
          return ''
        })()

        // Organizer mapping
        const organizer = {
          name: it.organizer?.memberName || it.organizer?.wxName || it.creatorName || '',
          memberName: it.organizer?.memberName || it.organizer?.wxName || it.creatorName || '',
          wxName: it.organizer?.wxName,
          avatar: it.organizer?.logo || it.creatorAvatar || '',
          logo: it.organizer?.logo || it.creatorAvatar || '',
          memberLevel: it.organizer?.levelLabel || '',
          tag: ''
        }

        const startRaw = it.startTime || (it.timeRange && it.timeRange.startTime) || ''
        const endRaw = it.endTime || (it.timeRange && it.timeRange.endTime) || ''

        // Fee
        const fee = it.isFree ? '0' : String(it.fee || (it.price && it.price.amount) || '')

        return {
          id: String(it.id),
          title,
          logo: poster,
          activityType: typeText,
          organizer,
          startTime: startRaw,
          endTime: endRaw,
          spaceName: it.spaceName || it.space?.name || '',
          fee,
          registeredUsers: it.registeredUsers || [],
          registeredCount: Number(it.joinedCount || it.registrationCount || 0),
          maxParticipants: Number(it.maxParticipants || 0),
          isLimitParticipants: !!(it.maxParticipants && it.maxParticipants > 0)
        }
      })
      this.setData({ currentList: mapped })
    } catch {
      wx.showToast({ title: '加载活动失败', icon: 'none' })
      this.setData({ currentList: [] })
    }
  },

  onBackTap() {
    wx.navigateBack()
  },

  onFollowTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const isFollowed = !((this.data as OtherProfileState).userInfo as UserInfoView).isFollowed
    const info = (this.data as OtherProfileState).userInfo as UserInfoView
    this.setData({
      'userInfo.isFollowed': isFollowed,
      'userInfo.followerCount': isFollowed ? info.followerCount + 1 : info.followerCount - 1,
    })
    wx.showToast({
      title: isFollowed ? '已关注' : '已取消关注',
      icon: 'none',
    })
  },

  onActivityTap(e: any) {
    const id = e.detail?.activity?.id || e.currentTarget.dataset.id
    console.log('onActivityTap click', id)
    if (id) {
      wx.navigateTo({
        url: `/pages/activity/detail?id=${id}`,
      })
    }
  },

  onFollowingTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const userId = ((this.data as OtherProfileState).userInfo as UserInfoView).userId
    wx.navigateTo({
      url: `/pages/user/list/index?title=关注&type=following&id=${userId}`,
    })
  },

  onFollowersTap(this: WechatMiniprogram.Page.TrivialInstance) {
    const userId = ((this.data as OtherProfileState).userInfo as UserInfoView).userId
    wx.navigateTo({
      url: `/pages/user/list/index?title=粉丝&type=followers&id=${userId}`,
    })
  },
})
