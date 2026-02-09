export interface UserApplyReqVO {
    formType: number // 表单类型（0=数字游民, 1=志愿者, 2=共创人）
    answers: Array<{ id: string; value: string | number | string[] }>
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
