import type { Activity, ActivityCollection } from '../model/activity'
import type { Homestay } from '../model/homestay'
import type { CompanionGroup, UserProfile } from '../model/user'
import type { ID, ImageResource, Price, TimeRange } from '../model/common'

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

const avatar1: ImageResource = {
  id: 'avatar-1',
  url: '/assets/images/default-avatar.png',
}

const defaultCompanions: CompanionGroup = {
  companions: [
    { id: 'c1', nickname: '伙伴一', avatar: avatar1 },
    { id: 'c2', nickname: '伙伴二', avatar: avatar1 },
    { id: 'c3', nickname: '伙伴三', avatar: avatar1 },
  ],
  totalCount: 12,
}

const baseTimeRange: TimeRange = {
  startTime: '2025/01/20',
  endTime: '2025/01/20',
}

const basePrice: Price = {
  amount: 199,
  currency: 'CNY',
  unit: '人',
}

const carouselMock: HomeCarouselItem[] = [
  {
    id: 'car-1',
    title: '龙潭剪纸体验',
    poster: {
      id: 'car-img-1',
      url: '/assets/images/activity.jpg',
    },
    description: '屏南数字游民生活周',
    category: '插画',
  },
  {
    id: 'car-2',
    title: '龙潭剪纸体验',
    poster: {
      id: 'car-img-2',
      url: '/assets/images/banner.jpg',
    },
    description: '科技学术类专题',
    category: '摄影漫游',
  },
  {
    id: 'car-3',
    title: '龙潭剪纸体验',
    poster: {
      id: 'car-img-3',
      url: '/assets/images/banner.jpg',
    },
    description: '乡村文化体验',
    category: '徒步',
  },
]

const entriesMock: HomeEntryItem[] = [
  {
    id: 'entry-illust',
    name: '插画',
    icon: {
      id: 'entry-illust-icon',
      url: '/assets/images/card-placeholder.png',
    },
    type: 'activityCategory',
    value: '插画',
  },
  {
    id: 'entry-photo',
    name: '摄影漫游',
    icon: {
      id: 'entry-photo-icon',
      url: '/assets/images/card-placeholder.png',
    },
    type: 'activityCategory',
    value: '摄影',
  },
  {
    id: 'entry-eco',
    name: '生态观察',
    icon: { id: 'entry-eco-icon', url: '/assets/images/card-placeholder.png' },
    type: 'activityCategory',
    value: '生态观察',
  },
  {
    id: 'entry-pottery',
    name: '陶艺',
    icon: {
      id: 'entry-pottery-icon',
      url: '/assets/images/card-placeholder.png',
    },
    type: 'activityCategory',
    value: '陶艺',
  },
  {
    id: 'entry-wood',
    name: '木工',
    icon: { id: 'entry-wood-icon', url: '/assets/images/card-placeholder.png' },
    type: 'activityCategory',
    value: '木工',
  },
  {
    id: 'entry-music',
    name: '音乐夜',
    icon: {
      id: 'entry-music-icon',
      url: '/assets/images/card-placeholder.png',
    },
    type: 'activityCategory',
    value: '音乐夜',
  },
  {
    id: 'entry-farm',
    name: '农耕体验',
    icon: { id: 'entry-farm-icon', url: '/assets/images/card-placeholder.png' },
    type: 'activityCategory',
    value: '农耕体验',
  },
  {
    id: 'entry-hike',
    name: '徒步',
    icon: { id: 'entry-hike-icon', url: '/assets/images/card-placeholder.png' },
    type: 'activityCategory',
    value: '徒步',
  },
]

const hotActivityMock: Activity[] = [
  {
    id: 'act-1',
    title: '进山路徒步一日体验',
    poster: {
      id: 'act-1-poster',
      url: '/assets/images/activity.jpg',
    },
    primaryCategory: 'ruralCulture',
    secondaryTag: { id: 'tag-hike', name: '徒步' },
    timeRange: baseTimeRange,
    price: basePrice,
    status: 'ongoing',
    space: {
      id: 'space-1',
      name: '龙潭山谷',
      address: '龙潭村入口集合',
    },
    companions: defaultCompanions,
  },
  {
    id: 'act-2',
    title: '进山路徒步一日体验',
    poster: {
      id: 'act-2-poster',
      url: '/assets/images/activity.jpg',
    },
    primaryCategory: 'ruralCulture',
    secondaryTag: { id: 'tag-hike', name: '徒步' },
    timeRange: baseTimeRange,
    price: basePrice,
    status: 'ongoing',
    space: {
      id: 'space-1',
      name: '龙潭山谷',
      address: '龙潭村入口集合',
    },
    companions: defaultCompanions,
  },
  {
    id: 'act-3',
    title: '进山路徒步一日徒步一日体验3',
    poster: {
      id: 'act-3-poster',
      url: '/assets/images/activity.jpg',
    },
    primaryCategory: 'ruralCulture',
    secondaryTag: { id: 'tag-hike', name: '徒步' },
    timeRange: baseTimeRange,
    price: basePrice,
    status: 'ongoing',
    space: {
      id: 'space-3',
      name: '龙潭山谷',
      address: '龙潭村入口集合',
    },
    companions: defaultCompanions,
  },
  {
    id: 'act-4',
    title: '进山路徒步一日徒步一日体验3',
    poster: {
      id: 'act-3-poster',
      url: '/assets/images/activity.jpg',
    },
    primaryCategory: 'ruralCulture',
    secondaryTag: { id: 'tag-hike', name: '徒步' },
    timeRange: baseTimeRange,
    price: basePrice,
    status: 'ongoing',
    space: {
      id: 'space-3',
      name: '龙潭山谷',
      address: '龙潭村入口集合',
    },
    companions: defaultCompanions,
  },
]

const collectionsMock: ActivityCollection[] = [
  {
    id: 'col-1',
    name: '周末自然漫游系列',
    description: '围绕龙潭自然与乡村文化的周末精选活动',
    cover: {
      id: 'col-1-cover',
      url: '/assets/images/activity.jpg',
    },
    activities: hotActivityMock,
  },
  {
    id: 'col-2',
    name: '周末自然漫游系列',
    description: '围绕龙潭自然与乡村文化的周末精选活动',
    cover: {
      id: 'col-1-cover',
      url: '/assets/images/activity.jpg',
    },
    activities: hotActivityMock,
  },
  {
    id: 'col-3',
    name: '周末自然漫游系列',
    description: '围绕龙潭自然与乡村文化的周末精选活动',
    cover: {
      id: 'col-1-cover',
      url: '/assets/images/activity.jpg',
    },
    activities: hotActivityMock,
  },
  {
    id: 'col-4',
    name: '周末自然漫游系列',
    description: '围绕龙潭自然与乡村文化的周末精选活动',
    cover: {
      id: 'col-1-cover',
      url: '/assets/images/activity.jpg',
    },
    activities: hotActivityMock,
  },
]

const homestayMock: Homestay[] = [
  {
    id: 'home-1',
    name: '龙潭风铃小院',
    cover: {
      id: 'home-1-cover',
      url: '/assets/images/homestay.jpg',
    },
    address: '龙潭村口向里步行五分钟',
    featureTags: [
      { id: 'tag-quiet', name: '安静庭院' },
      { id: 'tag-view', name: '山景房' },
    ],
    referencePrice: {
      amount: 2999,
      currency: 'CNY',
      unit: '周',
    },
  },
  {
    id: 'home-2',
    name: '龙潭风铃小院',
    cover: {
      id: 'home-1-cover',
      url: '/assets/images/homestay.jpg',
    },
    address: '龙潭村口向里步行五分钟',
    featureTags: [
      { id: 'tag-quiet', name: '安静庭院' },
      { id: 'tag-view', name: '山景房' },
    ],
    referencePrice: {
      amount: 2999,
      currency: 'CNY',
      unit: '周',
    },
  },
  {
    id: 'home-3',
    name: '龙潭风铃小院',
    cover: {
      id: 'home-1-cover',
      url: '/assets/images/homestay.jpg',
    },
    address: '龙潭村口向里步行五分钟',
    featureTags: [
      { id: 'tag-quiet', name: '安静庭院' },
      { id: 'tag-view', name: '山景房' },
    ],
    referencePrice: {
      amount: 2999,
      currency: 'CNY',
      unit: '周',
    },
  },
  {
    id: 'home-4',
    name: '龙潭风铃小院',
    cover: {
      id: 'home-1-cover',
      url: '/assets/images/homestay.jpg',
    },
    address: '龙潭村口向里步行五分钟',
    featureTags: [
      { id: 'tag-quiet', name: '安静庭院' },
      { id: 'tag-view', name: '山景房' },
    ],
    referencePrice: {
      amount: 2999,
      currency: 'CNY',
      unit: '周',
    },
  },
]

const aboutLinksMock: HomeAboutLink[] = [
  {
    id: 'about-history',
    title: '龙潭史',
    url: '/assets/images/card-placeholder.png',
    description: '了解龙潭的历史与故事',
  },
  {
    id: 'about-guide',
    title: '居住指南',
    url: '/assets/images/card-placeholder.png',
    description: '抵达与居住的实用信息',
  },
  {
    id: 'map-guide',
    title: '地图手册',
    url: '/assets/images/card-placeholder.png',
    description: '了解地图上的标志性地点',
  },
  {
    id: 'user-level',
    title: '身份等级',
    url: '/assets/images/card-placeholder.png',
    description: '了解您的身份等级',
  },
]

const homeMockData: HomePageData = {
  currentUser: {
    id: 'user-1',
    nickname: '龙潭访客',
    avatar: avatar1,
  },
  carousel: carouselMock,
  entries: entriesMock,
  hotActivities: hotActivityMock,
  collections: collectionsMock,
  homestays: homestayMock,
  aboutLinks: aboutLinksMock,
}

export function fetchHomeData(): Promise<HomePageData> {
  return Promise.resolve(homeMockData)
}
