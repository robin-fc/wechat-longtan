import type { Activity } from '../model/activity'
import type { Homestay } from '../model/homestay'
import type { ID } from '../model/common'
import { fetchHomeData } from './home'
import { getData } from '../utils/request'
import type { AppHomestayListRespVO } from '../model/homestay'

export interface AppGlobalSearchRespVO {
  activities?: Activity[];
  spaces?: any[];
  homestays?: AppHomestayListRespVO[];
  users?: any[];
}

export type SearchFrom = 'home' | 'activity'

export type SearchResultType = 'activity' | 'space' | 'homestay' | 'user'

export interface SearchResultItem {
  id: ID
  type: SearchResultType
  title: string
  subtitle?: string
  extra?: string
}

export interface HotSearchItem {
  id: ID
  keyword: string
}

export interface SearchPageData {
  placeholder: string
  hotKeywords: HotSearchItem[]
}

export function fetchSearchPageConfig(from: SearchFrom): SearchPageData {
  const placeholder =
    from === 'activity'
      ? '搜索活动/活动空间'
      : '搜索活动/活动空间/民宿/用户'
  const hotKeywords: HotSearchItem[] = [
    { id: 'kw-1', keyword: '进山路徒步' },
    { id: 'kw-2', keyword: '周末自然营' },
    { id: 'kw-3', keyword: '龙潭风铃小院' },
    { id: 'kw-4', keyword: '乡村音乐夜' },
    { id: 'kw-5', keyword: '生态观察' },
    { id: 'kw-6', keyword: '农耕体验' },
    { id: 'kw-7', keyword: '摄影漫游' },
    { id: 'kw-8', keyword: '插画工坊' },
  ]
  return {
    placeholder,
    hotKeywords,
  }
}

export async function searchAll(
  keyword: string
): Promise<SearchResultItem[]> {
  if (!keyword.trim()) {
    return []
  }
  const home = await fetchHomeData()
  const activities: SearchResultItem[] = home.hotActivities.map(
    (item: Activity) => ({
      id: item.id,
      type: 'activity',
      title: item.title,
      subtitle: item.space.name,
      extra: `${item.startTime} ~ ${item.endTime}`,
    })
  )
  const homestays: SearchResultItem[] = home.homestays.map(
    (item: Homestay) => ({
      id: item.id,
      type: 'homestay',
      title: item.name,
      subtitle: item.address,
      extra: `￥${item.minPrice}起`,
    })
  )
  const users: SearchResultItem[] = home.currentUser
    ? [
      {
        id: home.currentUser.id,
        type: 'user',
        title: home.currentUser.memberName,
      } as SearchResultItem,
    ]
    : []
  const all = [...activities, ...homestays, ...users]
  return all.filter((item) => item.title.indexOf(keyword) !== -1)
}

export function globalSearch(keyword: string): Promise<AppGlobalSearchRespVO> {
  return getData<AppGlobalSearchRespVO>('/app-api/daolongtan/search/global', { keyword })
}

