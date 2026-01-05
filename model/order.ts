export interface PayParams {
  timeStamp: string
  nonceStr: string
  packageData: string
  signType: string
  paySign: string
}

export interface AppGeneratePayParamsReqVO {
  bizOrderNo: string
  amount: number
}

export interface AppGeneratePayParamsRespVO {
  wxOrderNo: string
  bizOrderNo: string
  payParams: PayParams
}

export interface AppOrderCreateReqVO {
  roomId: number
  checkInDate: string
  checkOutDate: string
  contactName: string
  contactIdCard: string
  contactWechat: string
  contactPhone: string
}

export interface AppPayOrderCreateRespVO {
  msg: string
  data: any
  code: number
  bizOrderNo: string
}

export interface AppOrderListRespVO {
  bizOrderNo: string
  status: number
  title: string
  roomImage: string
  rootTags: string
  checkInDate: string
  checkOutDate: string
  nights: number
  unitPrice: number
  amountTotal: number
  createTime: string
}
