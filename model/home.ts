import type { Activity } from '../model/activity'
import type { ActivityCollection } from '../model/activity-collection'
import type { UserProfile } from '../model/user'
import { AppHomestayListRespVO } from '../model/homestay'
import { Banner } from '../model/banner'

export interface HomePageData {
  currentUser?: UserProfile
  carousel: Banner[]
  entries: AppActivityTypeRespVO[]
  hotActivities: Activity[]
  collections: ActivityCollection[]
  homestays: AppHomestayListRespVO[]
  aboutLinks: HomeAboutLink[]
}

export interface HomeAboutLink {
  id: number
  title: string
  url: string
  description?: string
  path?: string
}

export interface AppActivityTypeRespVO {
  value: string
  label: string
  logo: string
}
