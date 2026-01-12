import { fetchMockUserList } from '../../../api/user'
import type { MockUserItem } from '../../../api/user'
import { smartNavigateTo } from '../../../utils/navigation'
import { AppUserFollow, AppUserUnfollow } from '../../../api/user-follow'

interface UserListState {
  userList: MockUserItem[]
  loading: boolean
  title: string
  type: string // 'following' | 'followers' | 'registration'
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
    if (title) {
      wx.setNavigationBarTitle({
        title: decodeURIComponent(title)
      })
      this.setData({ title: decodeURIComponent(title) })
    }
    
    if (type) {
      this.setData({ type, relatedId: id || '' })
      this.loadData()
    }
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      const list = await fetchMockUserList(this.data.type, this.data.relatedId)
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
    const userId = e.currentTarget.dataset.id
    if (userId) {
      smartNavigateTo(`/pages/user/other-profile/index?userId=${userId}`)
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
