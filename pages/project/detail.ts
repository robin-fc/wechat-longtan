import {
  getProjectDetail,
  favoriteProject,
  unfavoriteProject,
  markInterest,
  cancelInterest,
} from '../../api/project'
import type { ProjectDetail, ProjectInterestUser } from '../../model/project'
import { formatYMD, parseToDate } from '../../utils/date'
import { parseGroupImages, prepareRichTextHtml } from '../../utils/html'
import { goBack, smartNavigateTo } from '../../utils/navigation'

type TabKey = 'detail' | 'group' | 'review'

interface InterestCompanion {
  id: number
  avatar: { url: string }
}

interface TabItem {
  key: TabKey
  name: string
}

function calcRemainingLabel(deadline: string | undefined, isCompleted: boolean): string {
  if (isCompleted) return '已完结'
  const end = parseToDate(deadline)
  if (!end) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  const diff = Math.ceil((end.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
  if (diff <= 0) return '已完结'
  return `剩余${diff}天`
}

function resolveDisplayTags(detail: ProjectDetail): string[] {
  if (detail.tags && detail.tags.length > 0) {
    return detail.tags.slice(0, 3)
  }
  const memberTags = detail.initiator?.memberTags || []
  if (memberTags.length > 0) {
    return memberTags.slice(0, 3)
  }
  if (detail.initiator?.memberLevel) {
    return [detail.initiator.memberLevel]
  }
  return []
}

function buildInterestCompanions(
  users: ProjectInterestUser[] | undefined,
  totalCount: number
): { companions: InterestCompanion[]; totalCount: number } {
  const list = users || []
  return {
    companions: list.slice(0, 5).map((u, index) => ({
      id: u.id ?? index,
      avatar: { url: u.logo },
    })),
    totalCount: totalCount || list.length,
  }
}

Page({
  data: {
    project: null as ProjectDetail | null,
    groupImages: [] as string[],
    displayTags: [] as string[],
    formattedDeadline: '',
    remainingLabel: '',
    isCompleted: false,
    interestTarget: 0,
    progressPercent: 0,
    interestCompanions: {
      companions: [] as InterestCompanion[],
      totalCount: 0,
    },
    tabs: [
      { key: 'detail', name: '项目详情' },
      { key: 'group', name: '项目群' },
      { key: 'review', name: '活动回顾' },
    ] as TabItem[],
    activeTab: 'detail' as TabKey,
    menuTop: 0,
    menuHeight: 44,
    showHomeButton: false,
    introductionHtml: '',
    summaryHtml: '',
  },

  onLoad(options: Record<string, string | undefined>) {
    const pages = getCurrentPages()
    this.setData({ showHomeButton: pages.length === 1 })

    const menuRect = wx.getMenuButtonBoundingClientRect()
    this.setData({
      menuTop: menuRect?.top ?? 0,
      menuHeight: menuRect?.height ?? 44,
    })

    const idRaw = options.id
    if (!idRaw) {
      wx.showToast({ title: '项目不存在', icon: 'none' })
      return
    }
    const id = Number(idRaw)
    if (!Number.isFinite(id) || id <= 0) {
      wx.showToast({ title: '项目ID不合法', icon: 'none' })
      return
    }
    this.loadDetail(id)
  },

  async loadDetail(id: number) {
    wx.showLoading({ title: '加载中...' })
    try {
      const raw = await getProjectDetail(id)
      console.log('project detail raw:', JSON.stringify(raw))
      // 兼容 data 嵌套
      const detail: any = (raw as any)?.project || (raw as any)?.data || raw
      if (!detail || !detail.id) {
        console.warn('project detail missing id, raw:', raw)
        wx.showToast({ title: '项目数据异常', icon: 'none' })
        return
      }
      const groupImages = parseGroupImages(detail.groupImages)

      const isCompleted = detail.projectStatus === 2
      const safeInterest = detail.interestCount || 0
      const interestTarget =
        detail.maxEnrollment > 0 ? detail.maxEnrollment : Math.max(safeInterest, 1)
      const progressPercent = Math.min(
        100,
        Math.round((safeInterest / interestTarget) * 100)
      )
      const displayTags = resolveDisplayTags(detail)

      this.setData({
        project: detail,
        groupImages,
        displayTags,
        formattedDeadline: formatYMD(detail.deadline),
        remainingLabel: calcRemainingLabel(detail.deadline, isCompleted),
        isCompleted,
        interestTarget,
        progressPercent,
        interestCompanions: buildInterestCompanions(detail.interestUsers, detail.interestCount),
        introductionHtml: prepareRichTextHtml(detail.introduction),
        summaryHtml: prepareRichTextHtml(detail.summary),
      })
    } catch (err) {
      console.error('Load project detail failed:', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  onInitiatorTap() {
    const userId = this.data.project?.initiator?.userId
    if (userId) smartNavigateTo(`/pages/user/other-profile/index?userId=${userId}`)
  },

  onBackTap() {
    if (this.data.showHomeButton) {
      wx.reLaunch({ url: '/pages/project/index' })
      return
    }
    goBack()
  },

  onTabTap(e: WechatMiniprogram.BaseEvent) {
    const key = e.currentTarget.dataset.key as TabKey
    if (!key || key === this.data.activeTab) return
    this.setData({ activeTab: key })
  },

  async onFavoriteTap() {
    const project = this.data.project
    if (!project) return

    try {
      if (project.favorited) {
        await unfavoriteProject(project.id)
        this.setData({ 'project.favorited': false })
        wx.showToast({ title: '已取消收藏', icon: 'none' })
      } else {
        await favoriteProject(project.id)
        this.setData({ 'project.favorited': true })
        wx.showToast({ title: '已收藏', icon: 'success' })
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async onInterestTap() {
    const project = this.data.project
    if (!project || this.data.isCompleted) return

    try {
      if (project.interested) {
        await cancelInterest(project.id)
        const interestCount = Math.max(0, project.interestCount - 1)
        this.setData({
          'project.interested': false,
          'project.interestCount': interestCount,
          progressPercent: Math.min(
            100,
            Math.round((interestCount / this.data.interestTarget) * 100)
          ),
          interestCompanions: buildInterestCompanions(project.interestUsers, interestCount),
        })
        wx.showToast({ title: '已取消看好', icon: 'none' })
      } else {
        await markInterest(project.id)
        const interestCount = project.interestCount + 1
        this.setData({
          'project.interested': true,
          'project.interestCount': interestCount,
          progressPercent: Math.min(
            100,
            Math.round((interestCount / this.data.interestTarget) * 100)
          ),
          interestCompanions: buildInterestCompanions(project.interestUsers, interestCount),
        })
        wx.showToast({ title: '已看好', icon: 'success' })
      }
    } catch (err) {
      console.error('Interest toggle failed:', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  onShareAppMessage() {
    const project = this.data.project
    if (!project) {
      return { title: 'DAO龙潭 - 社区项目', path: '/pages/project/index' }
    }
    return {
      title: project.title,
      path: `/pages/project/detail?id=${project.id}`,
      imageUrl: project.image,
    }
  },

  onShareTimeline() {
    const project = this.data.project
    if (!project) {
      return { title: 'DAO龙潭 - 社区项目' }
    }
    return {
      title: project.title,
      query: `id=${project.id}`,
    }
  },
})
