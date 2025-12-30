import { request } from '../utils/request'
import type {
  AppWeixinMiniAppCodeLoginReqVO,
  AppWeixinMiniAppLoginRespVO,
  AppRefreshTokenReqVO,
  AppGetPhoneNumberReqVO,
  AppGetPhoneNumberRespVO,
} from '../model/auth'

const baseUrl = "/app-api/daolongtan/auth"

export function login(data: AppWeixinMiniAppCodeLoginReqVO): Promise<AppWeixinMiniAppLoginRespVO> {
  return request<AppWeixinMiniAppLoginRespVO>({
    url: `${baseUrl}/weixin-mini-app-code-login`,
    method: 'POST',
    data,
  }).then((res) => res.data)
}

export function refreshToken(
  data: AppRefreshTokenReqVO
): Promise<AppWeixinMiniAppLoginRespVO> {
  return request<AppWeixinMiniAppLoginRespVO>({
    url: `${baseUrl}/refresh-token`,
    method: 'POST',
    data,
    // 刷新接口不依赖现有 accessToken，直接使用后端允许的占位认证头
    headers: {
      Authorization: 'Bearer test1',
    },
  }).then((res) => res.data)
}

// 手机号授权码换取手机号信息
export function postPhoneNumber(data: AppGetPhoneNumberReqVO): Promise<AppGetPhoneNumberRespVO> {
  return request<AppGetPhoneNumberRespVO>({
    url: `${baseUrl}/get-phone-number`,
    method: 'POST',
    data,
  }).then((res) => res.data)
}
