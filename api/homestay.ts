import {
  type HomestayRoom,
  type AppHomestayRoomListItem,
  type AppHomestayPackageItem,
  type AppHomestayListItem,
  type AppHomestayDetail,
  AppHomestayListRespVO,
  AppHomestayRoomListRespVO,
  HomestayApplication,
  AppOrderListRespVO,
  HomestayApplicationStatus,
} from '../model/homestay'
import { CommonResult, type ID, type PageResult } from '../model/common'
import { getData, request } from '../utils/request'

export async function getAvailableHomestayList(data?: {
  pageNo: string
  pageSize: string
  name?: string
  checkInDate?: string
}): Promise<PageResult<AppHomestayListRespVO>> {
  return getData<PageResult<AppHomestayListRespVO>>(
    '/app-api/daolongtan/homestay/list',
    data
  )
}

// Alias for compatibility or replace usages
export const fetchHomestayList = getAvailableHomestayList

export async function fetchHomestayDetail(
  id: number | string
): Promise<AppHomestayDetail> {
  const raw = await getData<AppHomestayDetail>(
    `/app-api/daolongtan/homestay/detail`,
    { id }
  )
  return {
    id: raw.id,
    name: raw.name,
    address: raw.address,
    mapImages: raw.mapImages,
    tags: [], // Detail doesn't return tags?
    logo: raw.logo,
    images: raw.images,
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
