import { getProjectPage, markInterest, cancelInterest } from '../../api/project'
import type { ProjectListItem } from '../../model/project'
import { smartNavigateTo } from '../../utils/navigation'

Page({
  data: {
    projects: [] as ProjectListItem[],
    keyword: '',
    statusList: [
      { name: '进行中', value: '1' },
      { name: '已完结', value: '2' },
    ],
    currentStatus: '1',
    pageNo: 1,
    hasMore: true,
    isLoading: false,
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1,
      })
    }
  },

  onLoad() {
    this.loadProjects()
  },

  async onPullDownRefresh() {
    this.setData({
      pageNo: 1,
      hasMore: true,
      projects: [],
    })
    await this.loadProjects()
    wx.stopPullDownRefresh()
  },

  async onReachBottom() {
    const { hasMore, pageNo } = this.data
    if (!hasMore) return
    this.setData({
      pageNo: pageNo + 1,
    })
    await this.loadProjects()
  },

  onStatusTap(e: WechatMiniprogram.BaseEvent) {
    const value = e.currentTarget.dataset.value as string
    if (value === this.data.currentStatus) return
    this.setData({
      currentStatus: value,
      pageNo: 1,
      hasMore: true,
      projects: [],
    })
    this.loadProjects()
  },

  onKeywordInput(e: WechatMiniprogram.Input) {
    const keyword = e.detail.value
    this.setData({ keyword })
    if (!keyword.trim()) {
      this.resetAndLoad()
    }
  },

  onSearchConfirm() {
    this.resetAndLoad()
  },

  resetAndLoad() {
    this.setData({
      pageNo: 1,
      hasMore: true,
      projects: [],
    })
    this.loadProjects()
  },

  async loadProjects() {
    const { pageNo, currentStatus, keyword } = this.data
    const pageSize = 10
    const trimmedKeyword = keyword.trim()

    this.setData({ isLoading: true })

    try {
      const res = await getProjectPage({
        projectStatus: currentStatus,
        pageNo: String(pageNo),
        pageSize: String(pageSize),
        ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
      })

      const list = (res?.list || []) as ProjectListItem[]
      const total = res?.total || 0
      const hasMore = total > pageNo * pageSize

      if (pageNo === 1) {
        this.setData({
          projects: list,
          hasMore,
        })
      } else {
        this.setData({
          projects: this.data.projects.concat(list),
          hasMore,
        })
      }
    } catch (err) {
      console.error('Load projects failed:', err)
    } finally {
      this.setData({ isLoading: false })
    }
  },

  onProjectTap(e: WechatMiniprogram.CustomEvent) {
    const id = e.detail?.id
    if (!id) return
    smartNavigateTo(`/pages/project/detail?id=${encodeURIComponent(id)}`)
  },

  onInitiatorTap(e: WechatMiniprogram.CustomEvent) {
    const userId = e.detail?.userId
    if (!userId) return
    smartNavigateTo(`/pages/user/other-profile/index?userId=${encodeURIComponent(userId)}`)
  },

  async onInterestTap(e: WechatMiniprogram.CustomEvent) {
    const { id, interested } = e.detail as { id: number; interested: boolean }
    if (!id || this.data.currentStatus === '2') return

    try {
      if (interested) {
        await cancelInterest(id)
        wx.showToast({ title: '已取消看好', icon: 'none' })
      } else {
        await markInterest(id)
        wx.showToast({ title: '已看好', icon: 'success' })
      }
      const projects = this.data.projects.map((item) => {
        if (item.id !== id) return item
        const delta = interested ? -1 : 1
        return {
          ...item,
          interested: !interested,
          interestCount: Math.max(0, (item.interestCount ?? 0) + delta),
        }
      })
      this.setData({ projects })
    } catch (err) {
      console.error('Interest action failed:', err)
      wx.showToast({ title: '操作失败，请重试', icon: 'none' })
    }
  },

  onShareAppMessage() {
    return {
      title: 'DAO龙潭 - 社区项目',
      path: '/pages/project/index',
    }
  },

  onShareTimeline() {
    return {
      title: 'DAO龙潭 - 社区项目',
    }
  },
})
