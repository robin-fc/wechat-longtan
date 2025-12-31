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

export interface HomestayListQuery {
  startDate?: string
  durationType?: 'week' | 'twoWeeks' | 'month' | 'threeMonths'
}

export async function fetchHomestayList(
  _query: HomestayListQuery
): Promise<Homestay[]> {
  const home = await fetchHomeData()
  return home.homestays
}

const roomImage: ImageResource = {
  id: 'room-img-1',
  url: '/assets/images/card-placeholder.png',
}

const baseStayRange: TimeRange = {
  startTime: '2025-02-01',
  endTime: '2025-02-08',
}

const baseRoomPrice: Price = {
  amount: 3999,
  currency: 'CNY',
  unit: '周',
}

const roomMock: HomestayRoom = {
  id: 'room-1',
  homestayId: 'home-1',
  name: '山景庭院大床房',
  images: [roomImage],
  description: '一周起住的山景庭院房间',
  stayDurationText: '一周起',
  price: baseRoomPrice,
  capacity: 2,
  facilities: ['独立卫浴', '观景露台', '地暖'],
}

const applicationMock: HomestayApplication = {
  id: 'apply-1',
  homestayId: 'home-1',
  roomId: 'room-1',
  applicantName: '龙潭访客',
  phone: '13800000000',
  wechatId: 'longtan_guest',
  idCard: '110101200001010010',
  stayRange: baseStayRange,
  status: 'pending',
  totalPrice: baseRoomPrice,
}

export async function fetchHomestayDetail(
  id: ID
): Promise<Homestay | undefined> {
  const list = await fetchHomestayList({})
  return list.find((it) => it.id === id)
}

export function fetchHomestayRoomDetail(
  _id: ID
): Promise<HomestayRoom> {
  return Promise.resolve(roomMock)
}

export function fetchHomestayApplications(): Promise<HomestayApplication[]> {
  return Promise.resolve([applicationMock])
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

