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

export interface AppGetPhoneNumberReqVO {
  // 手机号授权码，小程序通过 button 组件的 open-type='getPhoneNumber' 获取,示例值(081abc123)		true	
  phoneCode: string;
}

export interface AppGetPhoneNumberRespVO {
  /*用户绑定的手机号（国外手机号会有区号） */
  phoneNumber: string;

  /*没有区号的手机号 */
  purePhoneNumber: string;

  /*区号 */
  countryCode: string;
}
