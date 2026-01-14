import type { Activity } from '../model/activity'
import type { ActivityCollection } from '../model/activity-collection'
import type { UserProfile } from '../model/user'
import { AppHomestayListItem } from '../model/homestay'
import { Banner } from '../model/banner'

export interface HomePageData {
  currentUser?: UserProfile
  carousel: Banner[]
  entries: AppActivityTypeRespVO[]
  hotActivities: Activity[]
  collections: ActivityCollection[]
  homestays: AppHomestayListItem[]
  aboutLinks: HomeAboutLink[]
}

export interface HomeAboutLink {
  id: number
  title: string
  url: string
  description?: string
}

export interface AppActivityTypeRespVO {
  value: string
  label: string
  logo: string
}
