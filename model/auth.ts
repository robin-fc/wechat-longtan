export interface AppWeixinMiniAppCodeLoginReqVO {
  code: string
}

export interface AppWeixinMiniAppLoginRespVO {
  userId: number
  accessToken: string
  refreshToken: string
  expiresTime: string
  openid: string
}

export interface AppRefreshTokenReqVO {
  refreshToken: string
}
