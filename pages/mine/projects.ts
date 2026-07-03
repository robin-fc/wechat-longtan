import { fetchProjectPage } from '../../api/mine-v2'
import type { AppProjectListRespVO } from '../../model/mine-v2'
import { goBack, smartNavigateTo } from '../../utils/navigation'

type ProjectFilter = 'joined' | 'published'

interface MyProjectsState {
  activeFilter: ProjectFilter
  items: AppProjectListRespVO[]
}

const FILTER_TYPE_MAP: Record<ProjectFilter, number> = { joined: 1, published: 2 }

Page<MyProjectsState, WechatMiniprogram.IAnyObject>({
  data: {
    activeFilter: 'joined',
    items: [],
  },

  async onLoad(this: WechatMiniprogram.Page.TrivialInstance, options: Record<string, string | undefined>) {
    const filter = (options.filter as ProjectFilter) || 'joined'
    this.setData({ activeFilter: filter })
    await this.loadItems()
  },

  async loadItems(this: WechatMiniprogram.Page.TrivialInstance) {
    const type = FILTER_TYPE_MAP[(this.data as MyProjectsState).activeFilter]
    try {
      const result = await fetchProjectPage(type, 1, 20)
      this.setData({ items: result?.list || [] })
    } catch (e) { this.setData({ items: [] }) }
  },

  onFilterTap(this: WechatMiniprogram.Page.TrivialInstance, e: WechatMiniprogram.BaseEvent) {
    const filter = e.currentTarget.dataset.filter as ProjectFilter
    if (filter === (this.data as MyProjectsState).activeFilter) return
    this.setData({ activeFilter: filter, items: [] })
    this.loadItems()
  },

  onItemTap(this: WechatMiniprogram.Page.TrivialInstance, e: WechatMiniprogram.BaseEvent) {
    const id = e.currentTarget.dataset.id
    if (id) smartNavigateTo(`/pages/project/detail?id=${id}`)
  },

  onBackTap() {
    goBack()
  },
})
