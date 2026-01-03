import type { ImageResource, TimeRange, Price } from './common'

// 民宿标签映射
export const HOMESTAY_TAGS: Record<number, string> = {
  0: '全天热水',
  1: '免费Wi-Fi',
  2: '付费停车位',
  3: '免费停车位',
  4: '洗衣机',
  5: '行李寄存',
  6: '有早餐',
}

// 房间标签映射 (0=独立卫生间, 1=山景房, 2=海景房, 3=家庭房, 4=双床房, 5=大床房)
export const ROOM_TAGS: Record<number, string> = {
  0: '独立卫生间',
  1: '山景房',
  2: '海景房',
  3: '家庭房',
  4: '双床房',
  5: '大床房',
}

// ================= API VOs =================

export interface AppHomestayListRespVO {
  id: number
  name: string
  minPrice: number
  address: string
  mapImages: string // "url;url"
  tags: string // "0,1"
  reservedUsers: { userId: number; avatar: string }[]
}

export interface AppHomestayDetailRespVO {
  id: number
  name: string
  logo: string
  images: string // JSON string
  mapImages: string // "url;url"
  address: string
  description: string
  contact: string
}

export interface AppHomestayRoomListRespVO {
  id: number
  roomNumberWithPackage: string
  price: number
  logo: string
  tags: string // "0,1"
}

export interface AppHomestayPackageRespVO {
  packageType: number
  packageName: string
  days: number
}

export interface AppOrderListRespVO {
  orderNo: string
  status: number
  statusText: string
  title: string
  roomImage: string
  roomDetails: string
  checkInDate: string
  checkOutDate: string
  nights: number
  unitPrice: number
  amountTotal: number
  priceDescription: string
  createTime: string
}

// ================= Domain Models =================

export interface HomestayFeatureTag {
  id: number
  name: string
}

export interface Homestay {
  id: number
  name: string
  cover: ImageResource
  address: string
  featureTags: HomestayFeatureTag[]
  minPrice: number
  mapImages: string[]
  reservedUsers: { userId: number; avatar: string }[]
  // 新增字段
  description?: string
  roomCount?: number
  mapThumbnail?: ImageResource
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface HomestayRoom {
  id: string
  homestayId: string
  name: string
  images: ImageResource[]
  description: string
  stayDurationText: string
  price: Price
  capacity: number
  facilities: string[]
  // 新增字段
  attributes?: { label: string; value: string }[] // e.g. [{label: "房型", value: "大床"}]
  tags?: string[] // e.g. ["温馨", "硬件顶配"]
  guestAvatars?: string[]
  guestCount?: number
  // 详情页长文本
  intro?: string
  notice?: string
  priceRule?: string
  checkInProcess?: string
}

export interface HomestayDetail extends Homestay {
  logo: string
  images: ImageResource[]
  description: string
  contact: string
}

export interface HomestayPackage {
  packageType: number
  packageName: string
  days: number
}

export type HomestayApplicationStatus = 'pending' | 'confirmed' | 'canceled' | 'checkedIn' | 'unpaid'

export interface HomestayApplication {
  id: string // orderNo
  title: string
  status: HomestayApplicationStatus
  stayRange: TimeRange
  totalPrice: Price
  roomImage: string
  roomDetails: string
  applicantName?: string // Not in List API
  phone?: string // Not in List API
  homestayId?: string // Deprecated
  roomId?: string // Deprecated
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

