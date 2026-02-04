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
  status: string
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

export interface AccommodationInfo {
  homestayName: string
  roomName: string
  homestayAddress: string
  checkInDate: string
  checkOutDate: string
  nights: number
}

export interface ActivityInfo {
  activityStartTime: string
  activityEndTime: string
  activityLocation: string
  activityType: string
}

export interface AppOrderDetailRespVO {
  bizOrderNo: string
  status: string
  amountTotal: number
  bizType: number
  title: string
  activity?: ActivityInfo
  accommodation?: AccommodationInfo
  contactName: string
  contactPhone: string
  createTime: string
  payTime?: string
}

export interface ActivityOrder {
  id: string
  activityId: string | number
  title: string
  spaceName: string
  timeRange: {
    startTime: string
    endTime: string
  }
  notice: string
  status: string
  totalPrice: {
    amount: number
    currency: string
    unit?: string
  }
}

export interface AppActivityOrderCreateReqVO {
  activityId: number
  contactName?: string
  contactPhone?: string
}

export interface AppPayOrderCreateDataVO {
  bizOrderNo: string
  createTime: string
}
