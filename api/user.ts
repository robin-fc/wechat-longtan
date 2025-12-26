import { request } from '../utils/request'
import type { AppUpdateWeixinUserInfoReqVO } from '../model/user'
import type { CommonResult } from '../model/common'

export function updateUserInfo(data: AppUpdateWeixinUserInfoReqVO): Promise<CommonResult<boolean>> {
  return request<boolean>({
    url: '/app-api/daolongtan/user/update-info',
    method: 'PUT',
    data,
  })
}
