import { request } from '../utils/request'
import type { CommonResult } from '../model/common'
import { AppUserInfoRespVO } from '../model/user-follow'

const baseUrl = '/app-api/daolongtan/user-follow'

/**
 * 取消关注
 * @param {object} data 用户 APP - 用户关注 Request VO
 * @param {number} data.followeeId 被关注者ID
 * @returns
 */
export function AppUserUnfollow(data: {
  followeeId: number
}): Promise<CommonResult<boolean>> {
  return request<boolean>({
    url: `${baseUrl}/unfollow`,
    method: 'POST',
    data,
  })
}

/**
 * 关注用户
 * @param {object} data 用户 APP - 用户关注 Request VO
 * @param {number} params.followeeId 被关注者ID
 * @returns
 */
export function AppUserFollow(data: {
  followeeId: number
}): Promise<CommonResult<boolean>> {
  return request<boolean>({
    url: `${baseUrl}/follow`,
    method: 'POST',
    data,
  })
}

/**
 * 获取我关注的人列表（关注列表）
 * @returns
 */
export function AppUserFollow_getFollowings(): Promise<
  CommonResult<AppUserInfoRespVO[]>
> {
  return request<AppUserInfoRespVO[]>({
    url: `${baseUrl}/followings`,
    method: 'GET',
  })
}

/**
 * 获取关注我的人列表（粉丝列表）
 * @returns
 */
export function AppUserFollow_getFollowers(): Promise<
  CommonResult<AppUserInfoRespVO[]>
> {
  return request<AppUserInfoRespVO[]>({
    url: `${baseUrl}/followers`,
    method: 'GET',
  })
}
