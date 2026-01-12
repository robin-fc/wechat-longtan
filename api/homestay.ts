import {
  type Homestay,
  type HomestayRoom,
  type AppHomestayRoomListItem,
  type AppHomestayPackageItem,
  type AppHomestayListItem,
  type AppHomestayDetail,
  type HomestayFeatureTag,
  AppHomestayDetailRespVO,
  AppHomestayListRespVO,
  AppHomestayRoomListRespVO,
  HOMESTAY_TAGS,
  HomestayDetail,
  ROOM_TAGS,
  HomestayApplication,
  AppOrderListRespVO,
  HomestayApplicationStatus,
} from '../model/homestay'
import type { ID } from '../model/common'
import { getData } from '../utils/request'

// Helper to map tags string "0,1" to object array
function mapTags(
  tagsStr: string | undefined | null,
  mapping: Record<number, string>
): HomestayFeatureTag[] {
  if (tagsStr === undefined || tagsStr === null || tagsStr === '') return []
  const s = String(tagsStr)
  return s.split(',').map((item) => {
    const id = Number(item.trim())
    return { id, name: mapping[id] || '未知' }
  })
}

// Helper to get cover from mapImages
function getCover(
  mapImages: string | undefined,
  id: number
): { id: string; url: string } {
  let url = '/assets/images/homestay.jpg'
  if (mapImages && typeof mapImages === 'string') {
    url = mapImages.split(';')[0] || url
  }
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
    mapImages:
      it.mapImages && typeof it.mapImages === 'string'
        ? it.mapImages.split(';')
        : [],
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
    mapImages:
      raw.mapImages && typeof raw.mapImages === 'string'
        ? raw.mapImages.split(';')
        : [],
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
  return (raw || []).map((it) => {
    const tagNames = it.tags
      ? it.tags
          .split(',')
          .map((s) => ROOM_TAGS[Number(s)])
          .filter(Boolean)
      : []
    const duration = (it.roomNumberWithPackage || '').split('-')[1] || '一周起'

    return {
      id: String(it.id),
      homestayId: String(homestayId),
      name: it.roomNumberWithPackage,
      images: [{ id: `room-${it.id}`, url: it.logo }],
      description: '',
      stayDurationText: duration,
      price: { amount: it.price, currency: 'CNY', unit: '天' },
      capacity: 2,
      facilities: tagNames,
      tags: tagNames,
      attributes: [],
    }
  })
}

export async function fetchHomestayRoomDetail(id: ID): Promise<HomestayRoom> {
  console.warn(
    'fetchHomestayRoomDetail is deprecated/not supported by API. Returning empty mock.'
  )
  return {} as HomestayRoom
}

export function getHomestayAvailableRooms(params: {
  homestayId: string
  checkInDate: string
}): Promise<AppHomestayRoomListItem[]> {
  return getData('/app-api/daolongtan/homestay/room/list', params)
}

export function getHomestayPackageList(): Promise<AppHomestayPackageItem[]> {
  return getData('/app-api/daolongtan/homestay/package/list')
}

export function getHomestayAvailableList(): Promise<AppHomestayListItem[]> {
  return getData('/app-api/daolongtan/homestay/list')
}

export function getHomestayDetailApi(id: number): Promise<AppHomestayDetail> {
  return getData('/app-api/daolongtan/homestay/detail', { id })
}

export async function fetchHomestayApplications(): Promise<HomestayApplication[]> {
  // type=5 means all orders
  const raw = await getData<{ list: AppOrderListRespVO[]; total: number }>(
    '/app-api/daolongtan/order/my-list',
    { type: 5, pageNo: 1, pageSize: 100 }
  )
  return (raw.list || []).map((it) => ({
    id: it.orderNo,
    title: it.title,
    status: it.status as unknown as HomestayApplicationStatus,
   // status: mapStatus(it.status),
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

