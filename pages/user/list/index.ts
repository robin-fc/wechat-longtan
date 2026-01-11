import { fetchMockUserList } from '../../../api/user'
import type { MockUserItem } from '../../../api/user'
import { smartNavigateTo } from '../../../utils/navigation'

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

  onFollowTap(e: WechatMiniprogram.BaseEvent) {
    const index = e.currentTarget.dataset.index
    const list = this.data.userList
    const item = list[index]
    
    // Optimistic update
    const newItem = { ...item, isFollowed: !item.isFollowed }
    const newList = [...list]
    newList[index] = newItem
    
    this.setData({
      userList: newList
    })
    
    wx.showToast({
      title: newItem.isFollowed ? '已关注' : '已取消关注',
      icon: 'none'
    })
  }
})
