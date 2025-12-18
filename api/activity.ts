import type {
  Activity,
  ActivityCollection,
  ActivityPrimaryCategory,
} from '../model/activity'
import type { ID } from '../model/common'
import { fetchHomeData } from './home'

export interface ActivityFilterItem {
  id: ID
  name: string
}

export interface ActivityFilterGroup {
  id: ID
  name: string
  primaryCategory: ActivityPrimaryCategory | 'all'
  items: ActivityFilterItem[]
}

export interface ActivityListQuery {
  primaryCategory?: ActivityPrimaryCategory
  status?: 'ongoing' | 'upcoming' | 'finished'
}

export function fetchActivityFilters(): Promise<ActivityFilterGroup[]> {
  const groups: ActivityFilterGroup[] = [
    {
      id: 'group-all',
      name: '全部',
      primaryCategory: 'all',
      items: [
        { id: 'status-ongoing', name: '进行中' },
        { id: 'status-upcoming', name: '待开始' },
        { id: 'status-finished', name: '历史活动' },
      ],
    },
    {
      id: 'group-space',
      name: '空间',
      primaryCategory: 'space',
      items: [
        { id: 'space-a', name: '空间A' },
        { id: 'space-b', name: '空间B' },
        { id: 'space-c', name: '空间C' },
      ],
    },
    {
      id: 'group-creative',
      name: '文创',
      primaryCategory: 'cultureCreative',
      items: [
        { id: 'photo', name: '摄影' },
        { id: 'illust', name: '插画' },
        { id: 'wood', name: '木工' },
        { id: 'pottery', name: '陶艺' },
        { id: 'carve', name: '雕刻' },
      ],
    },
    {
      id: 'group-rural',
      name: '乡村文化',
      primaryCategory: 'ruralCulture',
      items: [
        { id: 'hike', name: '徒步' },
        { id: 'eco', name: '生态观察' },
        { id: 'music', name: '音乐夜' },
        { id: 'farm', name: '农耕体验' },
      ],
    },
  ]
  return Promise.resolve(groups)
}

export async function fetchActivityList(
  query: ActivityListQuery
): Promise<Activity[]> {
  const home = await fetchHomeData()
  let list = home.hotActivities
  if (query.primaryCategory) {
    list = list.filter(
      (it) => it.primaryCategory === query.primaryCategory
    )
  }
  return list
}

export async function fetchActivityCollections(): Promise<ActivityCollection[]> {
  const home = await fetchHomeData()
  return home.collections
}

export async function fetchActivityCollectionDetail(
  id: ID
): Promise<ActivityCollection | undefined> {
  const list = await fetchActivityCollections()
  return list.find((it) => it.id === id)
}

export async function fetchActivityDetail(
  id: ID
): Promise<Activity | undefined> {
  const home = await fetchHomeData()
  return home.hotActivities.find((it) => it.id === id)
}

