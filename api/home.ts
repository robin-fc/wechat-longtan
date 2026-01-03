import type { Activity, ActivityCollection } from '../model/activity'
import type { Homestay } from '../model/homestay'
import type { UserProfile } from '../model/user'
import type { ID, ImageResource } from '../model/common'

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
  homestays: Homestay[]
  aboutLinks: HomeAboutLink[]
}

const entriesMock: HomeEntryItem[] = [
  {
    id: 'entry-photo',
    name: '摄影',
    icon: { id: 'entry-photo-icon', url: '/assets/icons/home/camera.png' },
    type: 'activityCategory',
    value: '摄影',
  },
  {
    id: 'entry-illust',
    name: '插画',
    icon: { id: 'entry-illust-icon', url: '/assets/icons/home/drawing.png' },
    type: 'activityCategory',
    value: '插画',
  },
  {
    id: 'entry-writing',
    name: '写作',
    icon: { id: 'entry-writing-icon', url: '/assets/icons/home/work.png' },
    type: 'activityCategory',
    value: '写作',
  },
  {
    id: 'entry-wood',
    name: '木工',
    icon: { id: 'entry-wood-icon', url: '/assets/icons/home/ruler.png' },
    type: 'activityCategory',
    value: '木工',
  },
  {
    id: 'entry-story',
    name: '故事采集',
    icon: { id: 'entry-story-icon', url: '/assets/icons/home/story.png' },
    type: 'activityCategory',
    value: '故事采集',
  },
  {
    id: 'entry-hike',
    name: '徒步',
    icon: { id: 'entry-hike-icon', url: '/assets/icons/home/walking.png' },
    type: 'activityCategory',
    value: '徒步',
  },
  {
    id: 'entry-eco',
    name: '生态观察',
    icon: { id: 'entry-eco-icon', url: '/assets/icons/home/ecology.png' },
    type: 'activityCategory',
    value: '生态观察',
  },
  {
    id: 'entry-valley',
    name: '溪谷探访',
    icon: { id: 'entry-valley-icon', url: '/assets/icons/home/valley.png' },
    type: 'activityCategory',
    value: '溪谷探访',
  },
  {
    id: 'entry-history',
    name: '村史讲述',
    icon: { id: 'entry-history-icon', url: '/assets/icons/home/history.png' },
    type: 'activityCategory',
    value: '村史讲述',
  },
  {
    id: 'entry-market',
    name: '手作市集',
    icon: { id: 'entry-market-icon', url: '/assets/icons/home/market.png' },
    type: 'activityCategory',
    value: '手作市集',
  },
  {
    id: 'entry-music',
    name: '音乐夜',
    icon: { id: 'entry-music-icon', url: '/assets/icons/home/music.png' },
    type: 'activityCategory',
    value: '音乐夜',
  },
  {
    id: 'entry-artfest',
    name: '艺术节',
    icon: { id: 'entry-artfest-icon', url: '/assets/icons/home/art.png' },
    type: 'activityCategory',
    value: '艺术节',
  },
]

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

const homeMockData: HomePageData = {
  carousel: [],
  entries: entriesMock,
  hotActivities: [],
  collections: [],
  homestays: [],
  aboutLinks: aboutLinksMock,
}

export function fetchHomeData(): Promise<HomePageData> {
  return Promise.resolve(homeMockData)
}
