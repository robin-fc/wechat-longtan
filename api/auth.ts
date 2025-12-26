import { request } from '../utils/request'
import type {
  AppWeixinMiniAppCodeLoginReqVO,
  AppWeixinMiniAppLoginRespVO,
  AppRefreshTokenReqVO,
} from '../model/auth'

export function login(data: AppWeixinMiniAppCodeLoginReqVO): Promise<AppWeixinMiniAppLoginRespVO> {
  return request<AppWeixinMiniAppLoginRespVO>({
    url: '/app-api/daolongtan/auth/weixin-mini-app-code-login',
    method: 'POST',
    data,
  }).then((res) => res.data)
}

export function refreshToken(
  data: AppRefreshTokenReqVO
): Promise<AppWeixinMiniAppLoginRespVO> {
  return request<AppWeixinMiniAppLoginRespVO>({
    url: '/app-api/daolongtan/auth/refresh-token',
    method: 'POST',
    data,
    // 刷新接口不依赖现有 accessToken，直接使用后端允许的占位认证头
    headers: {
      Authorization: 'Bearer test1',
    },
  }).then((res) => res.data)
}
