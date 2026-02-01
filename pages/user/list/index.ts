import { AppUser_getUserList, mapMemberLevelLabel, mapMemberTags } from '../../../api/user'
import type { MockUserItem } from '../../../api/user'
import { smartNavigateTo } from '../../../utils/navigation'
import { AppUserFollow, AppUserUnfollow } from '../../../api/user-follow'

interface UserListState {
  userList: MockUserItem[]
  loading: boolean
  title: string
  type: string // 0=活动报名人员, 1=我的关注列表, 2=我的粉丝列表, 3=活动收藏人员, 4=他人关注列表, 5=他人粉丝列表, 6=民宿入住过的人列表
  relatedId?: string // userId or activityId
}

Page<UserListState, WechatMiniprogram.IAnyObject>({
  data: {
    userList: [],
    loading: false,
    title: '用户列表',
    type: '',
    relatedId: ''
  },

  onLoad(options: { title?: string; type?: string; id?: string }) {
    const { title, type, id } = options
    this.setData({
      type: type || '',
      relatedId: id || ''
    })

    if (title) {
      wx.setNavigationBarTitle({ title: decodeURIComponent(title) })
      this.setData({ title: decodeURIComponent(title) })
    } else if (type) {
      const typeTitleMap: Record<string, string> = {
        '0': '活动报名人员',
        '1': '我的关注',
        '2': '我的粉丝',
        '3': '活动收藏人员',
        '4': 'TA的关注',
        '5': 'TA的粉丝',
        '6': '入住过的人'
      }
      const autoTitle = typeTitleMap[type] || '用户列表'
      wx.setNavigationBarTitle({ title: autoTitle })
      this.setData({ title: autoTitle })
    }

    if (type) {
      this.loadData()
    }
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      const { type, relatedId } = this.data
      const params: any = {
        type,
        pageNo: 1,
        pageSize: 100
      }

      // Map type to specific ID parameters
      if (type === '0') {
        // 活动报名人员
        params.activityId = relatedId || undefined
      } else if (type === '1' || type === '2') {
        // 1=我的关注, 2=我的粉丝 (usually implies current user, but API might need userId if different context)
        // If it's "my" list, userId might be optional (implied by token) or explicit.
        // Assuming relatedId is passed if needed, otherwise it relies on token.
        params.userId = relatedId || undefined
      } else if (type === '3') {
        // 活动收藏人员
        params.activityId = relatedId || undefined
      } else if (type === '4' || type === '5') {
        // 4=他人关注, 5=他人粉丝
        params.userId = relatedId || undefined
      } else if (type === '6') {
        // 民宿入住过的人
        params.homeStayId = relatedId || undefined
      } else {
        // Fallback/Legacy
        params.bizId = relatedId || undefined
      }

      const res = await AppUser_getUserList(params)

      const list: MockUserItem[] = (res.data?.pageResult?.list || []).map((u) => {
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
          isFollowed: this.data.type === 'following',
        }
      })
      this.setData({ userList: list })
    } catch (e) {
      console.error(e)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  onUserTap(e: WechatMiniprogram.BaseEvent) {
    const { id: userId, isfollowed } = e.currentTarget.dataset
    if (userId) {
      smartNavigateTo(
        `/pages/user/other-profile/index?userId=${userId}&isFollowed=${isfollowed}`
      )
    }
  },

  async onFollowTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const index = Number(e.currentTarget.dataset.index)
    const list = this.data.userList || []
    const item = list[index]
    if (!item) return

    const userIdNum = Number(item.userId)
    if (!userIdNum) {
      wx.showToast({ title: '用户信息缺失', icon: 'none' })
      return
    }

    const nextFollowed = !item.isFollowed

    const setFollowed = (followed: boolean) => {
      const newList = list.slice()
      newList[index] = { ...item, isFollowed: followed }
      this.setData({ userList: newList })
    }

    const rollback = () => {
      const prevList = list.slice()
      prevList[index] = item
      this.setData({ userList: prevList })
    }

    const doFollow = async () => {
      setFollowed(true)
      try {
        await AppUserFollow({ followeeId: userIdNum })
        wx.showToast({ title: '已关注', icon: 'none' })
      } catch {
        rollback()
        wx.showToast({ title: '操作失败', icon: 'none' })
      }
    }

    const doUnfollow = async () => {
      setFollowed(false)
      try {
        await AppUserUnfollow({ followeeId: userIdNum })
        wx.showToast({ title: '已取消关注', icon: 'none' })
      } catch {
        rollback()
        wx.showToast({ title: '操作失败', icon: 'none' })
      }
    }

    if (nextFollowed) {
      await doFollow()
      return
    }

    wx.showModal({
      title: '取消关注',
      content: '确定要取消关注吗？',
      success: (res) => {
        if (!res.confirm) return
        doUnfollow()
      },
    })
  },
})
