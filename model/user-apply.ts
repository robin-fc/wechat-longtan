export interface UserApplyReqVO {
    name: string
    sex: number // 1:男 2:女 0:其他
    age: number
    mobile: string
    wechatId: string
    interests: string[]
    introduction: string
    source: string
}
