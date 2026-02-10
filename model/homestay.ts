import type { ImageResource, TimeRange, Price, PageResult } from './common'
import { AppUserInfoRespVO } from './user-follow'

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
export interface AppHomestayListResp {
  pageResult: PageResult<AppHomestayListRespVO>
  onSaleCount: number
}

export interface AppHomestayListReqVO {
  name?: string
  checkInDate?: string
  pageNo: string
  pageSize: string
}

export interface AppHomestayListRespVO {
  id: number
  name: string
  minPrice: number
  address: string
  mapImages: string[] // 民宿地图集（多张图片）
  tags: string[] // 民宿标签（每个数字对应一个标签：0=全天热水, 1=免费Wi-Fi, 2=付费停车位, 3=免费停车位, 4=洗衣机, 5=行李寄存, 6=有早餐）
  availableRoomsCount: number // 在售房型个数
  stayedUserCount: number // 已入住用户数
  stayedUsers: AppUserInfoRespVO[]
}

export interface AppHomestayRoomListReqVO {
  homestayId: string
  checkInDate: string
  checkOutDate: string
  packageType: string
  pageNo: string
  pageSize: string
}

export interface AppHomestayRoomListRespVO {
  availableRoomsCount: number // 在售房型个数
  rooms: AppHomestayRoomListItem[]
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

export interface HomestayRoom {
  id: string
  homestayId: string
  name: string
  images: ImageResource[]
  stayDurationText: string
  price: Price
  capacity: number
  facilities: string[]
  // 新增字段
  attributes?: { label: string; value: string }[] // e.g. [{label: "房型", value: "大床"}]
  tags?: string[] // e.g. ["温馨", "硬件顶配"]
  stayedUsers?: AppUserInfoRespVO[]
  // 详情页长文本
  description?: string
  bookingNotice?: string
  priceRule?: string
  checkInProcess?: string
}

export interface HomestayPackage {
  packageType: number
  packageName: string
  days: number
}

export type HomestayApplicationStatus =
  | 'pending'
  | 'confirmed'
  | 'canceled'
  | 'checkedIn'
  | 'unpaid'

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
  roomNumber: string
  logo: string
  tags: string
  price: number
  description: string
  phasePrice?: Array<{
    packageType: number
    price: number
  }>
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
  mapImages: string[]
  tags: string[]
  reservedUsers: ReservedUser[]
}

export interface AppHomestayDetail {
  /*民宿ID */
  id: number

  /*民宿名称 */
  name: string

  /*民宿logo */
  logo: string

  /*民宿图集 */
  images: string[]

  /*民宿地图集（多张图片） */
  mapImages: string[]

  /*民宿地址 */
  address: string

  /*民宿简介 */
  description: string

  /*民宿联系方式 */
  contact: string

  /*民宿标签（每个数字对应一个标签：0=全天热水, 1=免费Wi-Fi, 2=付费停车位, 3=免费停车位, 4=洗衣机, 5=行李寄存, 6=有早餐） */
  tags: string[]

  onSaleCount?: number


}
