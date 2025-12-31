import type {
  Homestay,
  HomestayApplication,
  HomestayRoom,
  AppHomestayRoomListItem,
  AppHomestayPackageItem,
  AppHomestayListItem,
  AppHomestayDetail,
} from '../model/homestay'
import type { ID, ImageResource, TimeRange, Price } from '../model/common'
import { fetchHomeData } from './home'
import { getData } from '../utils/request'

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

