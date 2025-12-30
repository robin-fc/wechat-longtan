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
  }).then((res) => {
    const payload = res && (res.data as AppWeixinMiniAppLoginRespVO | null)
    if (payload && payload.accessToken && payload.refreshToken && payload.expiresTime) {
      return payload
    }
    throw new Error((res && res.msg) || '登录失败，请重新获取授权码')
  })
}

export function refreshToken(
  data: AppRefreshTokenReqVO
): Promise<AppWeixinMiniAppLoginRespVO> {
  return request<AppWeixinMiniAppLoginRespVO>({
    url: `${baseUrl}/refresh-token`,
    method: 'POST',
    data,
    headers: {
      Authorization: 'Bearer test1',
    },
  }).then((res) => {
    const payload = res && (res.data as AppWeixinMiniAppLoginRespVO | null)
    if (payload && payload.accessToken && payload.refreshToken && payload.expiresTime) {
      return payload
    }
    throw new Error((res && res.msg) || '令牌刷新失败')
  })
}

// 手机号授权码换取手机号信息
export function postPhoneNumber(data: AppGetPhoneNumberReqVO): Promise<AppGetPhoneNumberRespVO> {
  return request<AppGetPhoneNumberRespVO>({
    url: `${baseUrl}/get-phone-number`,
    method: 'POST',
    data,
  }).then((res) => {
    const payload = res && (res.data as AppGetPhoneNumberRespVO | null)
    if (payload && payload.phoneNumber) {
      return payload
    }
    throw new Error((res && res.msg) || '绑定手机号失败，请重试')
  })
}
