import type { ID, ImageResource, Price, TimeRange } from './common'

export interface HomestayFeatureTag {
  id: ID
  name: string
}

export interface Homestay {
  id: ID
  name: string
  cover: ImageResource
  address: string
  featureTags: HomestayFeatureTag[]
  referencePrice: Price
}

export interface HomestayRoom {
  id: ID
  homestayId: ID
  name: string
  images: ImageResource[]
  description?: string
  stayDurationText: string
  price: Price
  capacity: number
  facilities: string[]
}

export type HomestayApplicationStatus =
  | 'pending'
  | 'confirmed'
  | 'canceled'
  | 'checkedIn'

export interface HomestayApplication {
  id: ID
  homestayId: ID
  roomId: ID
  applicantName: string
  phone: string
  wechatId: string
  idCard: string
  stayRange: TimeRange
  status: HomestayApplicationStatus
  totalPrice: Price
  canceledReason?: string
}

export interface AppHomestayRoomListItem {
  id: number
  roomNumberWithPackage: string
  price: number
  logo: string
  tags: string
}

export interface AppHomestayPackageItem {
  packageType: number
  packageName: string
  days: number
}

export interface ReservedUser {
  userId: number
  avatar: string
}

export interface AppHomestayListItem {
  id: number
  name: string
  minPrice: number
  address: string
  mapImages: string
  tags: string
  reservedUsers: ReservedUser[]
}

export interface AppHomestayDetail {
  id: number
  name: string
  logo: string
  images: string
  mapImages: string
  address: string
  description: string
  contact: string
}

