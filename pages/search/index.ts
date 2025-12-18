import {
  fetchSearchPageConfig,
  searchAll,
} from '../../api/search'
import type {
  SearchFrom,
  HotSearchItem,
  SearchResultItem,
} from '../../api/search'
import { smartNavigateTo, goBack } from '../../utils/navigation'

interface SearchPageState {
  from: SearchFrom
  keyword: string
  placeholder: string
  hotKeywords: HotSearchItem[]
  results: SearchResultItem[]
  hasSearched: boolean
}

Page<SearchPageState, WechatMiniprogram.IAnyObject>({
  data: {
    from: 'home',
    keyword: '',
    placeholder: '',
    hotKeywords: [],
    results: [],
    hasSearched: false,
  },
  onLoad(
    this: WechatMiniprogram.Page.TrivialInstance,
    options: WechatMiniprogram.Page.InstanceProperties['options']
  ) {
    const fromParam = options.from === 'activity' ? 'activity' : 'home'
    const config = fetchSearchPageConfig(fromParam)
    this.setData({
      from: fromParam,
      placeholder: config.placeholder,
      hotKeywords: config.hotKeywords,
    })
  },
  onBackTap() {
    goBack()
  },
  onKeywordInput(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.Input
  ) {
    this.setData({
      keyword: e.detail.value,
    })
  },
  onSearchConfirm() {
    this.doSearch()
  },
  onSearchTap() {
    this.doSearch()
  },
  onHotKeywordTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const keyword = e.currentTarget.dataset.keyword as string
    this.setData({
      keyword,
    })
    this.doSearch()
  },
  async doSearch(this: WechatMiniprogram.Page.TrivialInstance) {
    const keyword = (this.data as SearchPageState).keyword
    const results = await searchAll(keyword)
    this.setData({
      results,
      hasSearched: true,
    })
  },
  onResultTap(
    this: WechatMiniprogram.Page.TrivialInstance,
    e: WechatMiniprogram.BaseEvent
  ) {
    const item = e.currentTarget.dataset.item as SearchResultItem
    if (!item) {
      return
    }
    if (item.type === 'activity') {
      smartNavigateTo(
        `/pages/activity/detail?id=${encodeURIComponent(item.id)}`
      )
      return
    }
    if (item.type === 'homestay') {
      smartNavigateTo(
        `/pages/homestay/detail?id=${encodeURIComponent(item.id)}`
      )
      return
    }
  },
})
