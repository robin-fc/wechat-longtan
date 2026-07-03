import { fetchCommunityLifePage } from '../../api/mine-v2'
import type { AppProjectListRespVO } from '../../model/mine-v2'
import { goBack, smartNavigateTo } from '../../utils/navigation'

interface MyCommunityState {
  activeFilter: number // 1=文章, 2=视频
  items: AppProjectListRespVO[]
}

Page<MyCommunityState, WechatMiniprogram.IAnyObject>({
  data: {
    activeFilter: 1,
    items: [],
  },

  async onLoad(this: WechatMiniprogram.Page.TrivialInstance, options: Record<string, string | undefined>) {
    const filter = Number(options.filter) || 1
    this.setData({ activeFilter: filter === 2 ? 2 : 1 })
    await this.loadItems()
  },

  async loadItems(this: WechatMiniprogram.Page.TrivialInstance) {
    const type = (this.data as MyCommunityState).activeFilter
    try {
      const result = await fetchCommunityLifePage(type, 1, 20)
      this.setData({ items: result?.list || [] })
    } catch (e) { this.setData({ items: [] }) }
  },

  onFilterTap(this: WechatMiniprogram.Page.TrivialInstance, e: WechatMiniprogram.BaseEvent) {
    const filter = Number(e.currentTarget.dataset.filter)
    if (filter === (this.data as MyCommunityState).activeFilter) return
    this.setData({ activeFilter: filter, items: [] })
    this.loadItems()
  },

  onItemTap(this: WechatMiniprogram.Page.TrivialInstance, e: WechatMiniprogram.BaseEvent) {
    const url = e.currentTarget.dataset.url as string | undefined
    if (url) {
      wx.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(url)}` })
      return
    }
    const id = e.currentTarget.dataset.id
    if (id) smartNavigateTo(`/pages/project/detail?id=${id}`)
  },

  onBackTap() {
    goBack()
  },
})
