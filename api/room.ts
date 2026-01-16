import { AppRoomDetailReq, AppRoomDetailRes } from '../model/room'
import { getData } from '../utils/request'

const baseUrl = '/app-api/daolongtan/room'
/**
 * 获取房间详情
 * @param {string} id 房间ID
 * @returns
 */
export function getRoomDetail(
  params: AppRoomDetailReq
): Promise<AppRoomDetailRes> {
  return getData<AppRoomDetailRes>(`${baseUrl}/detail`, params)
}
