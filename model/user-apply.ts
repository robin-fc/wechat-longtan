export interface UserApplyReqVO {
    answers: Array<{ id: string; value: string | number | string[] }>
    // name: string
    // sex: number // 1:男 2:女 0:其他
    // age: number
    // mobile: string
    // wechatId: string
    // interests: string[]
    // introduction: string
    // source: string
}

export type AppUserApplyFormValueType =
  | 'text'
  | 'radio'
  | 'number'
  | 'tel'
  | 'checkbox_group'
  | 'textarea'
  | 'info_text'

export interface AppUserApplyFormOption {
  label: string
  value: string
}

export interface AppUserApplyFormQuestion {
  id: string
  label: string
  valueType: AppUserApplyFormValueType
  value?: string | string[]
  des?: string
  options?: AppUserApplyFormOption[]
}

export interface AppUserApplyFormRespVO {
  title?: string
  desc?: string
  questionList?: AppUserApplyFormQuestion[]
}
