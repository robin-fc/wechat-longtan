import type { ID, ImageResource, Price, TimeRange } from './common'
import type { CompanionGroup } from './user'

export type ActivityPrimaryCategory =
  | 'space'
  | 'cultureCreative'
  | 'ruralCulture'

export type ActivityStatus = 'ongoing' | 'upcoming' | 'finished'

export interface ActivityTag {
  id: ID
  name: string
}

export interface ActivitySpaceSummary {
  id: ID
  name: string
  address: string
}

export interface Activity {
  id: ID
  title: string
  poster: ImageResource
  primaryCategory: ActivityPrimaryCategory
  secondaryTag: ActivityTag
  timeRange: TimeRange
  price: Price
  status: ActivityStatus
  space: ActivitySpaceSummary
  companions: CompanionGroup
}

export interface ActivityCollection {
  id: ID
  name: string
  description?: string
  cover: ImageResource
  activities: Activity[]
}

