export interface AppRoomDetailReq {
  /*房间ID */
  id: number
}

export interface AppRoomDetailRes {
  bookingNotice: string;
  description: string;
  /*房间ID */
  id: number

  /*民宿ID */
  homestayId: number

  /*民宿名称 */
  homestayName: string

  /*房间号码 */
  roomNumber: string

  /*房间logo */
  logo: string

  /*房间照片（多张照片，JSON数组格式） */
  photos: string[]

  /*房间标签（标签文本数组：山景房, 海景房, 免费Wi-Fi） */
  tags: string[]

  /*房间价格 */
  price: number

  /*阶段价格（不同套餐类型的价格） */
  phasePrice?: Array<{
    packageType: number
    price: number
  }>

  /*房间属性列表（label-value格式） */
  attributes: {
    /*属性标签 */
    label: string

    /*属性值 */
    value: string
  }[]

  /* 预订须知 */
  bookNotice?: string

  /* 价格规则 */
  priceRule?: string

  /* 入住流程 */
  checkInProcess?: string
}
