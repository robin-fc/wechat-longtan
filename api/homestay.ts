import { getData } from '../utils/request'
import type {
  AppHomestayListRespVO,
  AppHomestayDetailRespVO,
  AppHomestayRoomListRespVO,
  AppHomestayPackageRespVO,
  AppOrderListRespVO,
  Homestay,
  HomestayDetail,
  HomestayRoom,
  HomestayPackage,
  HomestayApplication,
  HomestayApplicationStatus,
  HomestayFeatureTag,
} from '../model/homestay'
import { HOMESTAY_TAGS, ROOM_TAGS } from '../model/homestay'

import type { ID } from '../model/common'

// Helper to map tags string "0,1" to object array
function mapTags(
  tagsStr: string | undefined,
  mapping: Record<number, string>
): HomestayFeatureTag[] {
  if (!tagsStr) return []
  return tagsStr.split(',').map((s) => {
    const id = Number(s)
    return { id, name: mapping[id] || '未知' }
  })
}

// Helper to get cover from mapImages
function getCover(
  mapImages: string | undefined,
  id: number
): { id: string; url: string } {
  const url = mapImages
    ? mapImages.split(';')[0]
    : '/assets/images/homestay.jpg'
  return { id: String(id), url }
}

export async function getAvailableHomestayList(params?: {
  keyword?: string
}): Promise<Homestay[]> {
  const raw = await getData<AppHomestayListRespVO[]>(
    '/app-api/daolongtan/homestay/list',
    params
  )
  return (raw || []).map((it) => ({
    id: it.id,
    name: it.name,
    minPrice: it.minPrice,
    address: it.address,
    mapImages: it.mapImages ? it.mapImages.split(';') : [],
    featureTags: mapTags(it.tags, HOMESTAY_TAGS),
    cover: getCover(it.mapImages, it.id),
    reservedUsers: it.reservedUsers || [],
  }))
}

// Alias for compatibility or replace usages
export const fetchHomestayList = getAvailableHomestayList

export async function fetchHomestayDetail(
  id: number | string
): Promise<HomestayDetail> {
  const raw = await getData<AppHomestayDetailRespVO>(
    `/app-api/daolongtan/homestay/detail`,
    { id }
  )
  return {
    id: raw.id,
    name: raw.name,
    minPrice: 0, // Detail doesn't return price?
    address: raw.address,
    mapImages: raw.mapImages ? raw.mapImages.split(';') : [],
    featureTags: [], // Detail doesn't return tags?
    cover: { id: String(raw.id), url: raw.logo || '' }, // Use logo as cover
    reservedUsers: [],
    logo: raw.logo,
    images: raw.images
      ? JSON.parse(raw.images).map((url: string, idx: number) => ({
          id: String(idx),
          url,
        }))
      : [],
    description: raw.description,
    contact: raw.contact,
  }
}

export async function getAvailableRoomList(
  homestayId: number | string,
  checkInDate: string
): Promise<HomestayRoom[]> {
  const raw = await getData<AppHomestayRoomListRespVO[]>(
    `/app-api/daolongtan/homestay/room/list`,
    { homestayId, checkInDate }
  )
  return (raw || []).map((it) => ({
    id: it.id,
    roomNumberWithPackage: it.roomNumberWithPackage,
    price: it.price,
    logo: it.logo,
    tags: mapTags(it.tags, ROOM_TAGS),
  }))
}

export async function fetchHomestayRoomDetail(id: ID): Promise<HomestayRoom> {
  console.warn(
    'fetchHomestayRoomDetail is deprecated/not supported by API. Returning empty mock.'
  )
  return {} as HomestayRoom
}

export async function getPackageList(): Promise<HomestayPackage[]> {
  const raw = await getData<AppHomestayPackageRespVO[]>(
    '/app-api/daolongtan/homestay/package/list'
  )
  return (raw || []).map((it) => ({
    packageType: it.packageType,
    packageName: it.packageName,
    days: it.days,
  }))
}

// Map API status to local status
function mapStatus(status: number): HomestayApplicationStatus {
  switch (status) {
    case 1:
      return 'unpaid' // 待付款
    case 2:
      return 'pending' // 待审核 -> pending
    case 3:
      return 'confirmed' // 待入住 -> confirmed
    case 4:
      return 'checkedIn' // 已入住 -> checkedIn
    default:
      return 'canceled' // Assume others are canceled/finished
  }
}

export async function fetchHomestayApplications(): Promise<
  HomestayApplication[]
> {
  // type=5 means all orders
  const raw = await getData<{ list: AppOrderListRespVO[]; total: number }>(
    '/app-api/daolongtan/order/my-list',
    { type: 5, pageNo: 1, pageSize: 100 }
  )
  return (raw.list || []).map((it) => ({
    id: it.orderNo,
    title: it.title,
    status: mapStatus(it.status),
    stayRange: {
      startTime: new Date(it.checkInDate).toISOString(),
      endTime: new Date(it.checkOutDate).toISOString(),
    },
    totalPrice: {
      amount: it.amountTotal,
      currency: 'CNY',
    },
    roomImage: it.roomImage,
    roomDetails: it.roomDetails,
    applicantName: '', // Not returned
    phone: '', // Not returned
  }))
}
