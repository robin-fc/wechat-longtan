import type { Activity, ActivityCollection } from '../model/activity'
import type { UserProfile } from '../model/user'
import type { ID, ImageResource } from '../model/common'
import { AppHomestayListItem } from '../model/homestay'
import { getActivityTypeList } from './activity'

export interface HomeEntryItem {
  id: ID
  name: string
  icon: ImageResource
  type: 'activityCategory' | 'homestay' | 'collection' | 'space'
  value: string
}

export interface HomeCarouselItem {
  id: ID
  title: string
  poster: ImageResource
  description: string
  category: string
  url?: string
}

export interface HomeAboutLink {
  id: ID
  title: string
  url: string
  description?: string
}

export interface HomePageData {
  currentUser?: UserProfile
  carousel: HomeCarouselItem[]
  entries: HomeEntryItem[]
  hotActivities: Activity[]
  collections: ActivityCollection[]
  homestays: AppHomestayListItem[]
  aboutLinks: HomeAboutLink[]
}

async function buildEntriesFromApi(): Promise<HomeEntryItem[]> {
  try {
    const types = await getActivityTypeList('true')
    return (types || []).map((t) => ({
      id: `entry-${t.value}`,
      name: t.label || String(t.value),
      icon: {
        id: `entry-icon-${t.value}`,
        url: t.logo || '/assets/icons/home/default.png',
      },
      type: 'activityCategory',
      value: String(t.value),
    }))
  } catch {
    return []
  }
}

const aboutLinksMock: HomeAboutLink[] = [
  {
    id: 'about-history',
    title: '龙潭史',
    url: '/assets/icons/about/history.png',
    description: '了解龙潭的历史与故事',
  },
  {
    id: 'about-guide',
    title: '居住指南',
    url: '/assets/icons/about/lifeGuide.png',
    description: '抵达与居住的实用信息',
  },
  {
    id: 'map-guide',
    title: '地图手册',
    url: '/assets/icons/about/map.png',
    description: '了解地图上的标志性地点',
  },
  {
    id: 'user-level',
    title: '身份等级',
    url: '/assets/icons/about/diamond.png',
    description: '了解您的身份等级',
  },
]

export async function fetchHomeData(): Promise<HomePageData> {
  const entries = await buildEntriesFromApi()
  return {
    carousel: [],
    entries,
    hotActivities: [],
    collections: [],
    homestays: [],
    aboutLinks: aboutLinksMock,
  }
}
