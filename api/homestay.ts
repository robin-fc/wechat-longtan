import {
  type HomestayRoom,
  type AppHomestayPackageItem,
  type AppHomestayListItem,
  type AppHomestayDetail,
  AppHomestayListRespVO,
  AppHomestayRoomListRespVO,
  HomestayApplication,
  AppOrderListRespVO,
  HomestayApplicationStatus,
  AppHomestayRoomListReqVO,
  AppHomestayListReqVO,
} from '../model/homestay'
import { type ID, type PageResult } from '../model/common'
import { getData } from '../utils/request'
import { toISO8601 } from '../utils/isoTime'

const baseUrl = '/app-api/daolongtan/homestay'

export async function getAvailableHomestayList(data?: {
  pageNo: string
  pageSize: string
  name?: string
  checkInDate?: string
}): Promise<PageResult<AppHomestayListRespVO>> {
  return getData<PageResult<AppHomestayListRespVO>>(`${baseUrl}/list`, data)
}

// Alias for compatibility or replace usages
export const fetchHomestayList = getAvailableHomestayList

export async function fetchHomestayDetail(
  id: number | string
): Promise<AppHomestayDetail> {
  const raw = await getData<AppHomestayDetail>(`${baseUrl}/detail`, { id })
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

export async function fetchHomestayRoomDetail(id: ID): Promise<HomestayRoom> {
  console.warn(
    'fetchHomestayRoomDetail is deprecated/not supported by API. Returning empty mock.'
  )
  return {} as HomestayRoom
}

export function getHomestayAvailableRooms(
  params: AppHomestayRoomListReqVO
): Promise<AppHomestayRoomListRespVO> {
  const isoCheckInDate = toISO8601(params.checkInDate, '00:00:00')
  const isoCheckOutDate = toISO8601(params.checkOutDate, '00:00:00')
  return getData(`${baseUrl}/room/list`, {
    ...params,
    checkInDate: isoCheckInDate,
    checkOutDate: isoCheckOutDate,
  })
}

export function getHomestayPackageList(): Promise<AppHomestayPackageItem[]> {
  return getData(`${baseUrl}/package/list`)
}

export function getHomestayAvailableList(
  params: AppHomestayListReqVO
): Promise<PageResult<AppHomestayListRespVO>> {
  return getData(`${baseUrl}/list`, params)
}

export function getHomestayDetailApi(id: number): Promise<AppHomestayDetail> {
  return getData(`${baseUrl}/detail`, { id })
}

export async function fetchHomestayApplications(): Promise<
  HomestayApplication[]
> {
  // type=5 means all orders
  const raw = await getData<{ list: AppOrderListRespVO[]; total: number }>(
    `${baseUrl}/order/my-list`,
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

export function getHomestayStayedUsers(
  homestayId: number
): Promise<{ count: number; userList: any[] }> {
  // Reusing the structure similar to ActivityRegistration
  return getData<{ count: number; userList: any[] }>(`${baseUrl}/stayed-users`, {
    homestayId: String(homestayId),
  })
}
