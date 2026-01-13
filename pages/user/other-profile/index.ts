import { getData } from '../../../utils/request'
import { ensureActivityTypeDict } from '../../../api/activity'
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
  poster: string
  type: string
  organizer: {
    name: string
    avatar: string
    tag: string
  }
  time: string
  location: string
  statusText: string
  joinedUsers: string[]
  joinedCount: number
  price: string
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

  onLoad(
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
    ensureActivityTypeDict().then((dict) => {
      this.setData({ typeDict: dict })
    })
    this.loadUserInfo(String(userId || ''), isFollowed)
    this.loadActivities(0)
  },

  loadUserInfo(
    this: WechatMiniprogram.Page.TrivialInstance,
    userId: string,
    isFollowedOpt?: string
  ) {
    if (!userId) return
    getData('/app-api/daolongtan/user/detail', { userId })
      .then((raw: any) => {
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
        const memberLevel = String((raw && raw.memberLevel) ?? '')
        const levelLabel = levelMap[memberLevel] || ''
        const rawTags = raw && raw.tags
        const tags = (() => {
          if (Array.isArray(rawTags)) return rawTags.map((v: any) => String(v))
          const s = String(rawTags || '').trim()
          if (!s) return []
          if (s.startsWith('[') && s.endsWith(']')) {
            try {
              const arr = JSON.parse(s)
              if (Array.isArray(arr)) return arr.map((v: any) => String(v))
            } catch {}
          }
          return s.split(',')
        })()
          .map((v: string) => String(v).trim().replace(/^"+|"+$/g, ''))
          .filter(Boolean)
          .map((t: string) => {
            const n = Number(t)
            return !Number.isNaN(n) && orgTagMap[String(n)] ? orgTagMap[String(n)] : t
          })
        const allTags = [levelLabel, ...tags].filter(Boolean)
        const userInfo: UserInfoView = {
          userId: String((raw && raw.userId) ?? userId),
          avatar: (raw && (raw.logo || raw.avatar)) || '',
          bgImage: (raw && raw.bgImage) || '',
          nickname: (raw && (raw.memberName || raw.wxName || raw.nickname)) || '',
          gender: (raw && (raw.gender !== undefined ? raw.gender : 1)) || 1,
          tags: Array.from(new Set(allTags)),
          joinTime: formatYMDHM((raw && (raw.joinTime || raw.createTime || '')) || ''),
          bio: (raw && (raw.introduction || raw.bio || '')) || '',
          followingCount: Number((raw && raw.followingCount) || 0),
          followerCount: Number((raw && raw.followerCount) || 0),
          isFollowed:
            isFollowedOpt !== undefined &&
            isFollowedOpt !== 'undefined' &&
            isFollowedOpt !== ''
              ? isFollowedOpt === 'true'
              : !!(raw && raw.isFollowed),
        }
        this.setData({ userInfo })
      })
      .catch(() => {
        wx.showToast({ title: '加载用户信息失败', icon: 'none' })
      })
  },

  onTabChange(this: WechatMiniprogram.Page.TrivialInstance, e: WechatMiniprogram.BaseEvent) {
    const index = e.currentTarget.dataset.index as number
    this.setData({
      currentTab: index,
      pageNo: 1,
    })
    this.loadActivities(index)
  },

  loadActivities(this: WechatMiniprogram.Page.TrivialInstance, type: number) {
    const data = this.data as OtherProfileState
    const userId = data.userId || (data.userInfo && data.userInfo.userId) || ''
    if (!userId) {
      this.setData({ currentList: [] })
      return
    }
    const typeParam = type === 0 ? 1 : type === 1 ? 2 : 3
    const pageNo = data.pageNo || 1
    const pageSize = data.pageSize || 20
    getData('/app-api/daolongtan/activity/user-list', {
      userId,
      type: typeParam,
      pageNo,
      pageSize,
    })
      .then((res: any) => {
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
          const organizerName =
            it.organizer?.memberName ||
            it.organizer?.wxName ||
            it.creatorName ||
            ''
          const organizerAvatar =
            it.organizer?.logo || it.creatorAvatar || ''
          const organizerTag = ''
          const startRaw = it.startTime || (it.timeRange && it.timeRange.startTime) || ''
          const endRaw = it.endTime || (it.timeRange && it.timeRange.endTime) || ''
          const startTxt = startRaw ? formatYMDHM(startRaw) : ''
          const endTxt = endRaw ? formatYMDHM(endRaw) : ''
          const time = startTxt && endTxt ? `${startTxt}-${endTxt}` : (startTxt || endTxt || '')
          const location = it.spaceName || it.space?.name || ''
          const statusText = it.statusText || it.status || ''
          const joinedCount = Number(it.joinedCount || it.registrationCount || 0)
          const price =
            it.isFree ? '0' : String(it.fee || (it.price && it.price.amount) || '')
          return {
            id: String(it.id),
            title,
            poster,
            type: typeText,
            organizer: {
              name: organizerName,
              avatar: organizerAvatar,
              tag: organizerTag,
            },
            time,
            location,
            statusText,
            joinedUsers: [],
            joinedCount,
            price,
          }
        })
        this.setData({ currentList: mapped })
      })
      .catch(() => {
        wx.showToast({ title: '加载活动失败', icon: 'none' })
        this.setData({ currentList: [] })
      })
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

  onActivityTap(e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id as string
    wx.navigateTo({
      url: `/pages/activity/detail?id=${id}`,
    })
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
