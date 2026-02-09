

import { HomePageData } from '../model/home'
import { getActivityList, getActivityTypeList } from './activity'
import { getActivityCollections } from './activity-collection'
import { getBannerList } from './banner'
import { getAvailableHomestayList } from './homestay'

const aboutLinksMock = [
  {
    id: 1,
    title: '龙潭故事',
    url: '/assets/icons/about/history.svg',
    description: '了解龙潭的故事',
  },
  {
    id: 2,
    title: '生活指南',
    url: '/assets/icons/about/lifeGuide.svg',
    description: '抵达与居住的实用信息',
  },
  {
    id: 3,
    title: '地图手册',
    url: '/assets/icons/about/map.svg',
    description: '了解地图上的标志性地点',
  },
  {
    id: 4,
    title: '身份说明',
    url: '/assets/icons/about/diamond.svg',
    description: '了解您的身份标签',
  },
]

export async function fetchHomeData(): Promise<HomePageData> {
  const data: HomePageData = {
    carousel: [],
    entries: [],
    hotActivities: [],
    collections: [],
    homestays: [],
    aboutLinks: aboutLinksMock,
  }
  try {
    const entries = (await getActivityTypeList('false')) || []
    data.entries = entries
  } catch (e) {
    console.error('Fetch entries failed:', e)
  }
  try {
    const banners = await getBannerList()
    data.carousel = banners.slice()
  } catch (e) {
    console.error('Fetch banners failed:', e)
  }
  try {
    const res = await getActivityList({ pageNo: '1', pageSize: '5' })
    const pageResult = res?.pageResult || []
    data.hotActivities = pageResult.list || []
  } catch (e) {
    console.error('Fetch activities failed:', e)
  }
  try {
    const res = await getActivityCollections('1', '5')
    data.collections = (res && res.list) || []
  } catch (e) {
    console.error('Fetch collections failed:', e)
  }
  try {
    const res = await getAvailableHomestayList({
      pageNo: '1',
      pageSize: '5',
    })
    data.homestays = res?.list || []
  } catch (e) {
    console.error('Fetch homestays failed:', e)
  }
  return data
}
